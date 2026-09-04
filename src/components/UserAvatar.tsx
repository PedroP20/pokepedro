"use client";

import Image from "next/image";
import type { User } from "firebase/auth";
import { getUserPhotoUrl } from "@/lib/userProfile";

export default function UserAvatar({ user, alt, className, size }: { user: User | null; alt: string; className: string; size: number }) {
  const src = getUserPhotoUrl(user);
  return <Image src={src} alt={alt} width={size} height={size} unoptimized className={className} onError={(event) => { event.currentTarget.src = "/icon.png"; }} />;
}
