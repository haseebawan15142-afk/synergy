"use client";
import type { EventDoc } from "@/lib/admin/types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CrudManager, type CrudField } from "./CrudManager";
import { slugify } from "@/lib/admin/crud";
const fields: CrudField[]=[{key:"title",label:"Title",required:true},{key:"slug",label:"Slug",required:true},{key:"bannerUrl",label:"Banner",type:"media",folder:"events"},{key:"date",label:"Date",type:"date",required:true},{key:"location",label:"Location",required:true},{key:"description",label:"Description",type:"textarea",required:true},{key:"registrationLink",label:"Registration link"},{key:"galleryUrls",label:"Gallery URLs (comma-separated)"},{key:"status",label:"Status",type:"select",options:["draft","published","archived"]},{key:"active",label:"Active",type:"checkbox"}];
export function EventsManager(){return <CrudManager<EventDoc> title="Events" description="Create and publish events." collection={COLLECTIONS.events} fields={fields} empty="No events" initial={{title:"",slug:"",date:"",location:"",description:"",status:"draft",active:true}} normalize={(form)=>({...form,slug:form.slug||slugify(form.title),galleryUrls:Array.isArray(form.galleryUrls)?form.galleryUrls:String(form.galleryUrls||"").split(",").map(x=>x.trim()).filter(Boolean)})}/>;}
