import { and, desc, eq, isNull, ne } from "drizzle-orm";
import {
  auditLogs,
  branches,
  db,
  departments,
  doctors,
  loginHistory,
  notificationPreferences,
  passwordChangeLogs,
  userSessions,
  users
} from "@mediclinic/db";
import type { AccountUpdateInput, NotificationPreferenceInput, ProfileUpdateInput } from "../validations/profile.validation";

export async function getSettingsProfile(userId: string) {
  const [profile] = await db
    .select({
      id: users.id,
      branchId: users.branchId,
      branchName: branches.name,
      departmentId: users.departmentId,
      departmentName: departments.name,
      role: users.role,
      name: users.name,
      email: users.email,
      username: users.username,
      phone: users.phone,
      avatar: users.avatar,
      gender: users.gender,
      dob: users.dob,
      address: users.address,
      city: users.city,
      state: users.state,
      zipCode: users.zipCode,
      country: users.country,
      emergencyContact: users.emergencyContact,
      bio: users.bio,
      profileVisibility: users.profileVisibility,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      lastPasswordChangedAt: users.lastPasswordChangedAt,
      specialty: doctors.specialization,
      licenseNumber: doctors.licenseNumber,
      experienceYears: doctors.experienceYears,
      consultationFee: doctors.consultationFee
    })
    .from(users)
    .leftJoin(branches, eq(users.branchId, branches.id))
    .leftJoin(departments, eq(users.departmentId, departments.id))
    .leftJoin(doctors, eq(doctors.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  return profile ?? null;
}

export async function getUserPasswordHash(userId: string) {
  const [user] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId)).limit(1);
  return user?.passwordHash ?? null;
}

export async function listBranchesForSettings() {
  return db.select({ id: branches.id, name: branches.name }).from(branches).orderBy(branches.name);
}

export async function listDepartmentsForSettings() {
  return db.select({ id: departments.id, name: departments.name }).from(departments).orderBy(departments.name);
}

export async function updateProfile(userId: string, input: ProfileUpdateInput) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .update(users)
      .set({
        name: input.name,
        username: input.username,
        email: input.email.toLowerCase(),
        phone: input.phone,
        avatar: input.avatar,
        gender: input.gender,
        dob: input.dob,
        address: input.address,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        country: input.country,
        emergencyContact: {
          name: input.emergencyContact.name ?? "",
          phone: input.emergencyContact.phone ?? "",
          relationship: input.emergencyContact.relationship ?? ""
        },
        bio: input.bio,
        branchId: input.branchId,
        departmentId: input.departmentId ?? null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    if (user?.role === "doctor") {
      const [existingDoctor] = await tx.select({ id: doctors.id }).from(doctors).where(eq(doctors.userId, userId)).limit(1);
      if (existingDoctor) {
        await tx
          .update(doctors)
          .set({
            branchId: input.branchId,
            departmentId: input.departmentId ?? null,
            specialization: input.specialty || "General Medicine",
            licenseNumber: input.licenseNumber || "Pending",
            experienceYears: input.experienceYears,
            consultationFee: String(input.consultationFee),
            updatedAt: new Date()
          })
          .where(eq(doctors.userId, userId));
      }
    }

    return user;
  });
}

export async function updateAccount(userId: string, input: AccountUpdateInput) {
  const [user] = await db
    .update(users)
    .set({
      username: input.username,
      email: input.email.toLowerCase(),
      profileVisibility: input.profileVisibility,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))
    .returning();

  return user;
}

export async function getNotificationPreferences(userId: string) {
  const [preferences] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1);
  if (preferences) return preferences;

  const [created] = await db.insert(notificationPreferences).values({ userId }).returning();
  return created;
}

export async function updateNotificationPreferences(userId: string, input: NotificationPreferenceInput) {
  await getNotificationPreferences(userId);
  const [preferences] = await db
    .update(notificationPreferences)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(notificationPreferences.userId, userId))
    .returning();

  return preferences;
}

export async function changePassword(userId: string, passwordHash: string, sessionId: string, logoutOtherDevices: boolean, metadata: { ipAddress?: string; userAgent?: string }) {
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ passwordHash, lastPasswordChangedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));

    await tx.insert(passwordChangeLogs).values({
      userId,
      changedByUserId: userId,
      sessionId,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent
    });

    if (logoutOtherDevices) {
      await tx
        .update(userSessions)
        .set({ revokedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(userSessions.userId, userId), ne(userSessions.id, sessionId), isNull(userSessions.revokedAt)));
    }

    await tx.insert(auditLogs).values({
      actorUserId: userId,
      action: "settings.password.changed",
      resourceType: "user",
      resourceId: userId,
      metadata: { logoutOtherDevices },
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent
    });
  });
}

export async function listSessions(userId: string, currentSessionId: string) {
  const sessions = await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.userId, userId))
    .orderBy(desc(userSessions.lastSeenAt))
    .limit(20);

  return sessions.map((session) => ({ ...session, current: session.id === currentSessionId }));
}

export async function revokeSession(userId: string, sessionId: string) {
  const [session] = await db
    .update(userSessions)
    .set({ revokedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(userSessions.userId, userId), eq(userSessions.id, sessionId)))
    .returning();

  return session ?? null;
}

export async function listLoginHistory(userId: string) {
  return db
    .select({
      id: loginHistory.id,
      status: loginHistory.status,
      deviceName: loginHistory.deviceName,
      ipAddress: loginHistory.ipAddress,
      location: loginHistory.location,
      userAgent: loginHistory.userAgent,
      createdAt: loginHistory.createdAt
    })
    .from(loginHistory)
    .where(eq(loginHistory.userId, userId))
    .orderBy(desc(loginHistory.createdAt))
    .limit(30);
}
