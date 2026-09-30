// server/routes/p2p-payments.ts
//
// Кнопка «Поддержать служение сайта» — простая форма добровольного
// пожертвования. Имя и контакт необязательны. Заявка сохраняется в
// pending_payments, просматривать её можно в таблице базы данных.
// Ни аккаунтов, ни подписок, ни админ-действий здесь нет.
import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import { db } from "../db";
import { sql } from "drizzle-orm";

const router = Router();

export async function createPendingPayment(
  name: string | undefined,
  contact: string | undefined,
  amount: number,
  method: string
): Promise<{ id: string }> {
  // user_id в таблице NOT NULL, а аккаунтов нет, поэтому ставим случайный UUID.
  const anonymousId = randomUUID();

  const insertResult = await db.execute(
    sql`INSERT INTO pending_payments (user_id, user_email, amount, currency, status, method)
        VALUES (${anonymousId}, ${contact ?? null}, ${amount}, 'UAH', 'pending', ${method})
        RETURNING id`
  );

  return { id: String(insertResult.rows[0]?.id) };
}

// POST /api/p2p/request - записать пожертвование
router.post("/request", async (req: Request, res: Response) => {
  try {
    const { name, contact, method, amount } = req.body;

    if (!method) {
      return res.status(400).json({ error: "method обязателен" });
    }

    const donationAmount = Number(amount) > 0 ? Number(amount) : 1;
    const result = await createPendingPayment(name, contact, donationAmount, method);

    res.json({ success: true, id: result.id });
  } catch (err: any) {
    console.error("[P2P Request] Error:", err);
    res.status(500).json({ error: "Ошибка сохранения" });
  }
});

export default router;