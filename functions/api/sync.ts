
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

type PagesFunction<Env = any> = (context: {
  request: Request;
  env: Env;
  [key: string]: any;
}) => Response | Promise<Response>;

interface Env {
  AD_EXCLUSION_KV?: KVNamespace;
  AD_EXCLUSION_KV_STAGE?: KVNamespace;
}

// Helper za usporedbu objekata (za detekciju promjena u sadržaju)
function isRuleDifferent(r1: any, r2: any): boolean {
  // Ignoriramo isActive jer to ide u TOGGLE, ignoriramo createdAt
  const normalize = (r: any) => JSON.stringify({ ...r, isActive: true, createdAt: 0 });
  return normalize(r1) !== normalize(r2);
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  // Detect Environment
  const isProd = !!context.env.AD_EXCLUSION_KV;
  const db = context.env.AD_EXCLUSION_KV || context.env.AD_EXCLUSION_KV_STAGE;
  const bindingName = isProd ? "AD_EXCLUSION_KV (PROD)" : "AD_EXCLUSION_KV_STAGE (STAGE)";
  
  if (!db) {
    return new Response(JSON.stringify({ 
      rules: [], 
      error: `KV Binding Missing. Checked: ${bindingName}` 
    }), { status: 503, headers: { "Content-Type": "application/json" } });
  }

  // 1. Try to fetch standard Workspace data
  let data = await db.get("rules_data");

  // 2. Smart Fallback for STAGE/DEV:
  if (!data && !isProd) {
    const devData = await db.get("rules_data_dev");
    if (devData) {
      data = devData;
    }
  }

  return new Response(data || JSON.stringify({ rules: [], script: "" }), {
    headers: { 
      "Content-Type": "application/json",
      "X-AdEx-Source": isProd ? "PROD" : "STAGE",
      "X-KV-Binding": bindingName
    },
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.AD_EXCLUSION_KV || context.env.AD_EXCLUSION_KV_STAGE;
    
    if (!db) {
      throw new Error("KV Storage not bound. Please Redeploy.");
    }

    const body = await context.request.json();
    const { target, rules, script, user } = body;
    const storageKey = target === 'dev' ? "rules_data_dev" : "rules_data";
    
    // 1. Get current data for comparison
    const oldDataRaw = await db.get(storageKey);
    const oldData = oldDataRaw ? JSON.parse(oldDataRaw) : { rules: [], script: "" };
    const oldRules = oldData.rules || [];

    // 2. Prepare updated data
    const updatedData = {
      rules: rules || oldRules,
      script: script !== undefined ? script : oldData.script
    };

    // 3. Save to KV
    await db.put(storageKey, JSON.stringify(updatedData));
    
    // 4. Handle audit logging and snapshots
    const snapshotId = `snapshot_${Date.now()}`;
    await db.put(snapshotId, JSON.stringify(updatedData.rules));

    // --- DETALJNA DETEKCIJA PROMJENA ---
    let action = "UPDATE";
    let details = "";

    if (script) {
      // Slučaj: PUBLISH (Objava skripte)
      action = target === 'dev' ? "PUBLISH_DEV" : "PUBLISH_PROD";
      details = `Generirana i objavljena nova skripta (${rules.length} pravila) na ${target.toUpperCase()}.`;
    } else {
      // Slučaj: SAVE (Rad na pravilima)
      const newIds = new Set(rules.map((r: any) => r.id));
      const oldIds = new Set(oldRules.map((r: any) => r.id));

      // 1. Detekcija dodavanja
      const addedRule = rules.find((r: any) => !oldIds.has(r.id));
      
      // 2. Detekcija brisanja
      const deletedRule = oldRules.find((r: any) => !newIds.has(r.id));

      // 3. Detekcija izmjena
      const modifiedRule = rules.find((r: any) => {
        const old = oldRules.find((or: any) => or.id === r.id);
        return old && isRuleDifferent(r, old);
      });

      // 4. Detekcija toggle-a (samo status)
      const toggledRule = rules.find((r: any) => {
        const old = oldRules.find((or: any) => or.id === r.id);
        return old && r.isActive !== old.isActive && !isRuleDifferent(r, old);
      });

      if (addedRule) {
        action = "CREATE";
        details = `Kreirano novo pravilo: "${addedRule.name}"`;
      } else if (deletedRule) {
        action = "DELETE";
        details = `Obrisano pravilo: "${deletedRule.name}"`;
      } else if (modifiedRule) {
        action = "UPDATE";
        details = `Izmjenjene postavke pravila: "${modifiedRule.name}"`;
      } else if (toggledRule) {
        action = "TOGGLE";
        details = `Pravilo "${toggledRule.name}" je ${toggledRule.isActive ? 'uključeno' : 'isključeno'}`;
      } else {
        // Fallback ako nismo sigurni (npr. promjena redoslijeda)
        details = `Ažuriranje liste pravila (Workspace Save)`;
      }
    }

    const auditLogsRaw = await db.get("audit_log");
    const auditLogs = auditLogsRaw ? JSON.parse(auditLogsRaw) : [];
    
    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      user: user || 'system',
      action,
      details,
      snapshotId
    };

    // RETENTION POLICY: Keep only last 30 logs
    const updatedLogs = [newEntry, ...auditLogs].slice(0, 30);
    await db.put("audit_log", JSON.stringify(updatedLogs));

    // DEV specific logic: Sync Workspace with Dev Publish
    if (target === 'dev') {
       const workspaceDataRaw = await db.get("rules_data");
       const workspaceData = workspaceDataRaw ? JSON.parse(workspaceDataRaw) : { rules: [], script: "" };
       await db.put("rules_data", JSON.stringify({
         ...workspaceData,
         rules: rules || workspaceData.rules
       }));
    }
    
    return new Response(JSON.stringify({ success: true, environment: target }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
