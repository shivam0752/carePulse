import Image from 'next/image'
import React from 'react'
import PatientForm from "@/components/forms/PatientForm";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import RegisterForm from '@/components/forms/RegisterFrom';
import { getUser } from '@/lib/actions/patient.actions';
import * as Sentry from '@sentry/nextjs'

const Register = async ({params: {userId}}: SearchParamProps) => {

      const user = await getUser(userId);

      Sentry.metrics.set("user_view_register", user.name)

  return (
   <div className="flex h-screen max-h-screen">
   <section className="remove-scrollbar container">
     <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
       <Image src="/assets/icons/logo-full.svg"
       height={1000}
       width={1000}
       alt="logo"
       className="mb-12 h-10 w-fit" />

       <RegisterForm user = {user} />

      <p className="copyright py-12">© 2024 CarePulse</p>
     
     </div>
   </section>

   <Image src="/assets/images/register-img.png"
       height={1000}
       width={1000}
       alt="doctors"
       className="side-img max-w-[490px]" />
 </div>
  )
}

export default Register