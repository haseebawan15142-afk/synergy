"use client";
import type { FaqDoc } from "@/lib/admin/types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CrudManager, type CrudField } from "./CrudManager";
const fields: CrudField[]=[{key:"question",label:"Question",required:true},{key:"answer",label:"Answer",type:"textarea",required:true},{key:"category",label:"Category",required:true},{key:"sortOrder",label:"Sort order",type:"number"},{key:"active",label:"Active",type:"checkbox"}];
export function FaqManager(){return <CrudManager<FaqDoc> title="FAQs" description="Organize answers by category and order." collection={COLLECTIONS.faq} fields={fields} empty="No FAQs" initial={{question:"",answer:"",category:"General",sortOrder:0,active:true}}/>;}
