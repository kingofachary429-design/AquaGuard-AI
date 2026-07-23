import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function useUserRole() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("citizen");
  const [loadingRole, setLoadingRole] = useState(true);
  const [roleError, setRoleError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setLoadingRole(true);
        setRoleError("");

        if (!currentUser) {
          setUser(null);
          setRole("citizen");
          setLoadingRole(false);
          return;
        }

        setUser(currentUser);

        try {
          const userReference = doc(
            db,
            "users",
            currentUser.uid
          );

          const userSnapshot = await getDoc(
            userReference
          );

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();

            const savedRole = String(
              userData.role || "citizen"
            ).toLowerCase();

            if (savedRole === "admin") {
              setRole("admin");
            } else if (
              savedRole === "authority"
            ) {
              setRole("authority");
            } else {
              setRole("citizen");
            }
          } else {
            setRole("citizen");
          }
        } catch (error) {
          console.error(
            "Unable to load user role:",
            error
          );

          setRole("citizen");
          setRoleError(
            "User role load avvaledu. Default citizen access applied."
          );
        } finally {
          setLoadingRole(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    user,
    role,
    loadingRole,
    roleError,
    isAdmin: role === "admin",
    isAuthority:
      role === "admin" || role === "authority",
  };
}