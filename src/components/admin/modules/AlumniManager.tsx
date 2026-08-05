"use client";
import type { AlumniDoc } from "@/lib/admin/types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CrudManager, type CrudField } from "./CrudManager";
const fields: CrudField[]=[{key:"name",label:"Name",required:true},{key:"imageUrl",label:"Photo",type:"media",folder:"general"},{key:"batch",label:"Batch"},{key:"department",label:"Department"},{key:"designation",label:"Designation"},{key:"company",label:"Company"},{key:"linkedin",label:"LinkedIn"},{key:"bio",label:"Bio",type:"textarea"},{key:"achievements",label:"Achievements",type:"textarea"},{key:"sortOrder",label:"Sort order",type:"number"},{key:"featured",label:"Featured",type:"checkbox"},{key:"active",label:"Active",type:"checkbox"}];
export function AlumniManager(){return <CrudManager<AlumniDoc> title="Alumni" description="Maintain alumni spotlights and achievements." collection={COLLECTIONS.alumni} fields={fields} empty="No alumni profiles" initial={{name:"",sortOrder:0,featured:false,active:true}}/>;}
