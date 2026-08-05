"use client";
import type { TestimonialDoc } from "@/lib/admin/types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CrudManager, type CrudField } from "./CrudManager";
const fields: CrudField[]=[{key:"name",label:"Name",required:true},{key:"company",label:"Company"},{key:"designation",label:"Designation"},{key:"review",label:"Review",type:"textarea",required:true},{key:"rating",label:"Rating",type:"number",required:true},{key:"photoUrl",label:"Photo",type:"media",folder:"testimonials"},{key:"sortOrder",label:"Sort order",type:"number"},{key:"featured",label:"Featured",type:"checkbox"},{key:"active",label:"Active",type:"checkbox"}];
export function TestimonialsManager(){return <CrudManager<TestimonialDoc> title="Testimonials" description="Manage client feedback and ratings." collection={COLLECTIONS.testimonials} fields={fields} empty="No testimonials" initial={{name:"",review:"",rating:5,sortOrder:0,featured:false,active:true}}/>;}
