import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Group, GroupIcon } from "@bolao/shared-types";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

interface GroupsContextValue {
  groups: Group[];
  loading: boolean;
  refresh: () => Promise<void>;
  createGroup: (name: string, icon: GroupIcon) => Promise<Group>;
  joinGroup: (inviteCode: string) => Promise<Group>;
}

const GroupsContext = createContext<GroupsContextValue | null>(null);

export function GroupsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!token) {
      setGroups([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.listGroups(token);
      setGroups(res.groups);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh().catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const createGroup = async (name: string, icon: GroupIcon) => {
    if (!token) throw new Error("Faça login para criar um grupo");
    const { group } = await api.createGroup(token, name, icon);
    setGroups((prev) => [...prev, group]);
    return group;
  };

  const joinGroup = async (inviteCode: string) => {
    if (!token) throw new Error("Faça login para entrar em um grupo");
    const { group } = await api.joinGroup(token, inviteCode);
    setGroups((prev) => (prev.some((g) => g.id === group.id) ? prev : [...prev, group]));
    return group;
  };

  const value = useMemo(
    () => ({ groups, loading, refresh, createGroup, joinGroup }),
    [groups, loading, token]
  );

  return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>;
}

export function useGroups() {
  const ctx = useContext(GroupsContext);
  if (!ctx) throw new Error("useGroups precisa estar dentro de <GroupsProvider>");
  return ctx;
}
