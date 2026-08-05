"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listCollection } from "@/lib/admin/crud";
import { COLLECTIONS, type AdminUser } from "@/lib/firebase/collections";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { AdminPageHeader, Card, EmptyState, StatusBadge } from "@/components/admin/ui";
export function UsersManager(){const [items,setItems]=useState<AdminUser[]|null>(null);useEffect(()=>{listCollection<AdminUser>(COLLECTIONS.users).then(setItems).catch(e=>{toast.error(e instanceof Error?e.message:"Failed to load users");setItems([])})},[]);if(!items)return <AdminPageSkeleton/>;return <div className="space-y-6"><AdminPageHeader title="Users" description="Admin user roles are read-only from this screen."/><Card><p className="text-sm text-zinc-500">To add or change access, run the configured admin seed script and update the users collection through approved administration workflows.</p></Card>{!items.length?<EmptyState title="No users" description="Run the admin seed script to create the initial administrator."/>:<div className="space-y-3">{items.map(item=><Card key={item.uid} className="flex justify-between py-4"><div><p className="font-medium">{item.displayName||item.email}</p><p className="text-sm text-zinc-500">{item.email}</p></div><StatusBadge status={item.role}/></Card>)}</div>}</div>}
