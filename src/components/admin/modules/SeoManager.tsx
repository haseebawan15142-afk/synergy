"use client";
import type { SeoPageDoc } from "@/lib/admin/types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CrudManager, type CrudField } from "./CrudManager";
const fields:CrudField[]=[{key:"pageId",label:"Page ID",required:true},{key:"title",label:"Title",required:true},{key:"description",label:"Description",type:"textarea",required:true},{key:"keywords",label:"Keywords"},{key:"robots",label:"Robots"},{key:"canonical",label:"Canonical URL"},{key:"ogTitle",label:"Open Graph title"},{key:"ogDescription",label:"Open Graph description",type:"textarea"},{key:"ogImage",label:"Open Graph image",type:"media",folder:"seo"},{key:"twitterCard",label:"Twitter card"},{key:"jsonLd",label:"JSON-LD",type:"textarea"}];
export function SeoManager(){return <CrudManager<SeoPageDoc> title="SEO Pages" description="Manage page-level metadata and structured data." collection={COLLECTIONS.seo} fields={fields} empty="No SEO pages" initial={{pageId:"",title:"",description:""}} orderField="pageId"/>;}
