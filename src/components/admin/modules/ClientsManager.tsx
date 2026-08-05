"use client";
import type { ClientDoc } from "@/lib/admin/types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CrudManager, type CrudField } from "./CrudManager";
const fields: CrudField[]=[{key:"name",label:"Name",required:true},{key:"logoUrl",label:"Logo",type:"media",folder:"clients"},{key:"website",label:"Website"},{key:"category",label:"Category"},{key:"sortOrder",label:"Sort order",type:"number"},{key:"featured",label:"Featured",type:"checkbox"},{key:"active",label:"Active",type:"checkbox"}];
export function ClientsManager(){return <CrudManager<ClientDoc> title="Clients" description="Maintain client logos and profile links." collection={COLLECTIONS.clients} fields={fields} empty="No clients" initial={{name:"",sortOrder:0,featured:false,active:true}}/>;}
