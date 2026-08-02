import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

import { PartnersLogoCarousel } from "@/components/partners/PartnersLogoCarousel";



export const metadata: Metadata = {

  title: "Partners",

  description: "Technology principals and strategic alliances — Synergy Computers Pakistan.",

};



export default function PartnersPage() {

  return (

    <>

      <PageHeader

        title="Our principals"

        description="Strategic alliances with global technology leaders."

      />

      <PartnersLogoCarousel

        className="border-t-0"

        title="Technology partners"

      />

    </>

  );

}

