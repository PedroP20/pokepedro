import type { User } from "firebase/auth";

/** O Firebase pode manter a foto apenas no providerData após renovar a sessão. */
export function getUserPhotoUrl(user: User | null): string {
  if (!user) return "/icon.png";
  return user.photoURL || user.providerData.find((provider) => provider.photoURL)?.photoURL || "/icon.png";
}
