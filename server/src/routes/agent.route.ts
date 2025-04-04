import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { handleAgentQuery } from "../controllers/agent.controller";
dotenv.config();

const router = express.Router();

router.post("/agent", async (req: Request, res: Response): Promise<any> => {
  // typescript was with an strange error: No overload matches this call if do not pass Promise<any>.
  const { query } = req.body;

  try {
    const result = await handleAgentQuery(query);
    return res.json(result);
  } catch (error: any) {
    console.error("Error in /agent:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
