"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitSessionReport(formData: FormData) {
  const supabase = await createClient();
  
  const class_id = formData.get("class_id") as string;
  const session_date = formData.get("session_date") as string;
  const status = formData.get("status") as string;
  const surah = formData.get("surah") as string;
  const ayahs = formData.get("ayahs") as string;
  const memorization_score = parseInt(formData.get("memorization_score") as string, 10);
  const tajweed_remarks = formData.get("tajweed_remarks") as string;
  const homework = formData.get("homework") as string;

  const { error } = await supabase.from("sessions").insert({
    class_id,
    session_date,
    status,
    surah,
    ayahs,
    memorization_score,
    tajweed_remarks,
    homework,
  });

  if (error) {
    console.error("Error submitting session report:", error);
    return { error: error.message };
  }

  revalidatePath("/teacher");
  return { success: true };
}
