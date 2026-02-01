import { createClient } from "@/lib/supabase/server";
import type {
  Schedule,
  ScheduleSlotWithRelations,
  ScheduleSnapshot,
  ScheduleSnapshotWithCreator,
  ScheduleStatus,
  ScheduleWithSlotCount,
} from "@/types/db";

// --------------------------------- SCHEDULES ---------------------------------

async function getSchedules(schoolId: string): Promise<ScheduleWithSlotCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedules")
    .select("*, schedule_slots(count)")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((schedule: any) => ({
    ...schedule,
    slot_count: schedule.schedule_slots?.[0]?.count ?? 0,
  }));
}

async function getScheduleById(scheduleId: string): Promise<Schedule | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("id", scheduleId)
    .single();

  if (error) return null;
  return data;
}

async function getActiveSchedule(schoolId: string): Promise<Schedule | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("school_id", schoolId)
    .eq("status", "active")
    .single();

  if (error) return null;
  return data;
}

async function createSchedule(params: {
  schoolId: string;
  name: string;
  createdBy: string;
  status?: ScheduleStatus;
  validFrom: string;
  validTo?: string | null;
}): Promise<Schedule> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedules")
    .insert({
      school_id: params.schoolId,
      name: params.name,
      status: params.status ?? "draft",
      valid_from: params.validFrom,
      valid_to: params.validTo ?? null,
      created_by: params.createdBy,
      modified_by: params.createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateSchedule(
  scheduleId: string,
  updates: {
    name?: string;
    status?: ScheduleStatus;
    validFrom?: string;
    validTo?: string | null;
    modifiedBy: string;
  },
): Promise<Schedule> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedules")
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.validFrom !== undefined && { valid_from: updates.validFrom }),
      ...(updates.validTo !== undefined && { valid_to: updates.validTo }),
      modified_at: new Date().toISOString(),
      modified_by: updates.modifiedBy,
    })
    .eq("id", scheduleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function activateSchedule(scheduleId: string): Promise<Schedule> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedules")
    .update({ status: "active" })
    .eq("id", scheduleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function duplicateSchedule(
  scheduleId: string,
  newName: string,
  userId: string,
): Promise<Schedule> {
  const supabase = await createClient();

  // Get the original schedule
  const { data: original, error: getError } = await supabase
    .from("schedules")
    .select("*")
    .eq("id", scheduleId)
    .single();

  if (getError || !original) throw getError ?? new Error("Schedule not found");

  // Create a new schedule as draft
  const { data: newSchedule, error: createError } = await supabase
    .from("schedules")
    .insert({
      school_id: original.school_id,
      name: newName,
      status: "draft" as ScheduleStatus,
      valid_from: original.valid_from,
      valid_to: original.valid_to,
      created_by: userId,
      modified_by: userId,
    })
    .select()
    .single();

  if (createError || !newSchedule) throw createError ?? new Error("Failed to create schedule");

  // Copy all schedule slots from original to new schedule
  const { data: slots, error: slotsError } = await supabase
    .from("schedule_slots")
    .select("*")
    .eq("schedule_id", scheduleId);

  if (slotsError) throw slotsError;

  if (slots && slots.length > 0) {
    const newSlots = slots.map((slot) => ({
      schedule_id: newSchedule.id,
      school_id: slot.school_id,
      grade_id: slot.grade_id,
      subject_id: slot.subject_id,
      teacher_id: slot.teacher_id,
      day_of_week: slot.day_of_week,
      period_number: slot.period_number,
    }));

    const { error: insertError } = await supabase.from("schedule_slots").insert(newSlots);
    if (insertError) throw insertError;
  }

  return newSchedule;
}

async function deleteSchedule(scheduleId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("schedules").delete().eq("id", scheduleId);

  if (error) throw error;
}

// --------------------------------- SCHEDULE SNAPSHOTS ---------------------------------

async function getScheduleSnapshots(scheduleId: string): Promise<ScheduleSnapshotWithCreator[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_snapshots")
    .select("*, created_by_user:users!schedule_snapshots_created_by_fkey(*)")
    .eq("schedule_id", scheduleId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as ScheduleSnapshotWithCreator[];
}

async function createScheduleSnapshot(params: {
  scheduleId: string;
  reason?: string;
  createdBy: string;
}): Promise<ScheduleSnapshot> {
  const supabase = await createClient();

  // Get all current slots for this schedule
  const { data: slots, error: slotsError } = await supabase
    .from("schedule_slots")
    .select("*")
    .eq("schedule_id", params.scheduleId);

  if (slotsError) throw slotsError;

  // Create the snapshot with current slot data
  const { data, error } = await supabase
    .from("schedule_snapshots")
    .insert({
      schedule_id: params.scheduleId,
      snapshot_data: slots ?? [],
      reason: params.reason ?? null,
      created_by: params.createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function restoreScheduleSnapshot(snapshotId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  // Get the snapshot
  const { data: snapshot, error: getError } = await supabase
    .from("schedule_snapshots")
    .select("*")
    .eq("id", snapshotId)
    .single();

  if (getError || !snapshot) throw getError ?? new Error("Snapshot not found");

  const scheduleId = snapshot.schedule_id;
  const slotsData = snapshot.snapshot_data as any[];

  // Delete all current slots for this schedule
  const { error: deleteError } = await supabase
    .from("schedule_slots")
    .delete()
    .eq("schedule_id", scheduleId);

  if (deleteError) throw deleteError;

  // Re-insert the slots from the snapshot (without the old IDs)
  if (slotsData && slotsData.length > 0) {
    const newSlots = slotsData.map((slot) => ({
      schedule_id: scheduleId,
      school_id: slot.school_id,
      grade_id: slot.grade_id,
      subject_id: slot.subject_id,
      teacher_id: slot.teacher_id,
      day_of_week: slot.day_of_week,
      period_number: slot.period_number,
    }));

    const { error: insertError } = await supabase.from("schedule_slots").insert(newSlots);
    if (insertError) throw insertError;
  }

  // Update the schedule's modified_at
  await supabase
    .from("schedules")
    .update({
      modified_at: new Date().toISOString(),
      modified_by: userId,
    })
    .eq("id", scheduleId);
}

async function deleteScheduleSnapshot(snapshotId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("schedule_snapshots").delete().eq("id", snapshotId);

  if (error) throw error;
}

// --------------------------------- SCHEDULE SLOTS ---------------------------------

async function getScheduleSlots(scheduleId: string): Promise<ScheduleSlotWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_slots")
    .select(
      `
      *,
      grade:grades(*),
      teacher:users(
        *,
        specialty_subject:subjects(*)
      ),
      subject:subjects(*)
    `,
    )
    .eq("schedule_id", scheduleId)
    .order("day_of_week")
    .order("period_number");

  if (error) throw error;
  return data;
}

export const ScheduleService = {
  getSchedules,
  getScheduleById,
  getActiveSchedule,
  createSchedule,
  updateSchedule,
  activateSchedule,
  duplicateSchedule,
  deleteSchedule,
  // Snapshots
  getScheduleSnapshots,
  createScheduleSnapshot,
  restoreScheduleSnapshot,
  deleteScheduleSnapshot,
  // Slots
  getScheduleSlots,
};
