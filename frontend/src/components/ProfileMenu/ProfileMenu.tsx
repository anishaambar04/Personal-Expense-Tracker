import { useState } from "react";
import type { User } from "../../services/AuthServices";
import styles from "./ProfileMenu.module.scss";

interface ProfileMenuProps {
  user: User;
  onViewProfile: () => void;
  onSignOut: () => void;
}

function ProfileMenu({ user, onViewProfile, onSignOut }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleProfile = () => {
    setIsOpen(false);
    onViewProfile();
  };

  const handleSignOut = () => {
    setIsOpen(false);
    onSignOut();
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.account}
        onClick={() => setIsOpen((previous) => !previous)}
        type="button"
      >
        <div className={styles.avatar}>
          {user.username.charAt(0).toUpperCase()}
        </div>

        <div className={styles.userInfo}>
          <strong>{user.username}</strong>
          <span>Personal account</span>
        </div>

        <span className={styles.arrow}>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <button onClick={handleProfile}>
            <span>👤</span>
            View Profile
          </button>

          <div className={styles.divider} />

          <button className={styles.signOut} onClick={handleSignOut}>
            <span>↪</span>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
