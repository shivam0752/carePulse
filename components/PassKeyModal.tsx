'use client'
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
 } from "@/components/ui/alert-dialog"

 import {
   InputOTP,
   InputOTPGroup,
   InputOTPSeparator,
   InputOTPSlot,
 } from "@/components/ui/input-otp"
import { decryptKey, encryptKey } from "@/lib/utils";
 
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react"

const PassKeyModal = () => {
   const router = useRouter();
   const path = usePathname();
   const [open, setOpen] = useState(true);
   const [passkey, setPasskey] = useState('');
   const [error, setError] = useState('');

   const encryptedKey = typeof window !== 'undefined' ? window.localStorage.getItem('accesskey'): null;

   useEffect(()=>{
      const accessKey = encryptedKey && decryptKey(encryptedKey);
      if(path){
         if(accessKey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY){
            const encryptedKey = encryptKey(passkey);
            
            setOpen(false);
            router.push('/admin');
         } else {
            setOpen(true);
         }
      }

   },[encryptedKey])
   const closeModal = () => {
      setOpen(false);
      router.push('/');
   }

   const validatePasskey =(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) =>{
      e.preventDefault();
      if(passkey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY){
         const encryptedKey = encryptKey(passkey);
         localStorage.setItem('accesskey', encryptedKey);
         setOpen(false);
      } else {
         setError('Invalid passkey. Please try again.');
      }


   }

  return (
    <AlertDialog open ={open} onOpenChange={setOpen}>
      <AlertDialogContent className="shad-alert-dialog">
         <AlertDialogHeader>
            <AlertDialogTitle className="flex items-start justify-between">
               Admin Access Verification
               <Image
               height={20} width={20}
               alt="close"src="/assets/icons/close.svg"
               onClick={() => closeModal()}
               className="cursor-pointer"
               />
               </AlertDialogTitle>
            <AlertDialogDescription>
               To access the admin page please enter the pass key.
            </AlertDialogDescription>
         </AlertDialogHeader>
         <div>
            <InputOTP maxLength={6} value={passkey} onChange={(value) => setPasskey(value)}>
               <InputOTPGroup className="shad-otp">
                  <InputOTPSlot index={0} className="shad-otp-slot"/>
                  <InputOTPSlot index={1} className="shad-otp-slot" />
                  <InputOTPSlot index={2} className="shad-otp-slot" />
                  <InputOTPSlot index={3} className="shad-otp-slot" />
                  <InputOTPSlot index={4} className="shad-otp-slot"/>
                  <InputOTPSlot index={5} className="shad-otp-slot"/>
               </InputOTPGroup>
            </InputOTP>

            {error && <p className="shad-error text-14-regular mt-4 flex justify-center">
               {error}
               </p>}
         </div>
         <AlertDialogFooter>
            
            <AlertDialogAction
            onClick={(e) => validatePasskey(e)}
            className="shad-primary-btn w-full"
            >Enter Admin Passkey</AlertDialogAction>
         </AlertDialogFooter>
      </AlertDialogContent>
</AlertDialog>

  )
}

export default PassKeyModal