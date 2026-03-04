
//import { httpClient } from "./httpClient";

// Opción A (recomendada): pedir TODO y paginar en el front (como exige “exactamente 16 por página”)
//export async function fetchMyInventory() {
  // Ajusta ruta según tu backend real:
  // - PDF menciona GET /api/v1/players/me/inventory
  //const { data } = await httpClient.get("/api/v1/players/me/inventory");
  //return data; // debe ser array de items
//}

/**
 * Opción B (si tu backend ya pagina):
 * GET /api/v1/players/me/inventory?page=1&pageSize=16
 * (no la uso por defecto porque tu criterio pide 16 exactos por página, y tu backend puede no estar listo)
 */


// Generador de items simulados

import { httpClient } from "./httpClient";

// ✅ Export nombrado que tu hook está esperando
export async function fetchMyInventory() {
  // Si aún no tienes backend, esto fallará y tu hook usará MOCK_ITEMS
  const { data } = await httpClient.get("/api/v1/players/me/inventory");
  return data;
}