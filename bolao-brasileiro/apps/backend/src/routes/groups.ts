import { Router } from "express";
import { z } from "zod";
import {
  createGroup,
  groups,
  groupsForUser,
  isGroupMember,
  joinGroupByInviteCode,
  membersOfGroup,
} from "../store.js";
import { requireAuth } from "../middleware/auth.js";

export const groupsRouter = Router();

groupsRouter.use(requireAuth);

const createGroupSchema = z.object({
  name: z.string().trim().min(1).max(60),
  icon: z.enum(["trophy", "ball", "medal", "flag"]),
});

groupsRouter.post("/", (req, res) => {
  const parsed = createGroupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const group = createGroup(parsed.data.name, parsed.data.icon, req.userId!);
  res.status(201).json({ group });
});

groupsRouter.get("/", (req, res) => {
  res.json({ groups: groupsForUser(req.userId!) });
});

groupsRouter.get("/:id", (req, res) => {
  const group = groups.find((g) => g.id === req.params.id);
  if (!group) {
    res.status(404).json({ error: "Grupo não encontrado" });
    return;
  }
  if (!isGroupMember(group.id, req.userId!)) {
    res.status(403).json({ error: "Você não faz parte desse grupo" });
    return;
  }

  res.json({ group, members: membersOfGroup(group.id) });
});

const joinGroupSchema = z.object({
  inviteCode: z.string().trim().min(1).max(12),
});

groupsRouter.post("/join", (req, res) => {
  const parsed = joinGroupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const group = joinGroupByInviteCode(parsed.data.inviteCode, req.userId!);
  if (!group) {
    res.status(404).json({ error: "Código de convite inválido" });
    return;
  }

  res.json({ group });
});
