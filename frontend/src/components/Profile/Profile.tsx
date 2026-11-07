import type { User } from "../../services/AuthServices";
import styles from "./Profile.module.scss";

interface ProfileProps {
  user: User;
  onBack: () => void;
}

function Profile({ user, onBack }: ProfileProps) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <button className={styles.backButton} onClick={onBack}>
          ← Back to Dashboard
        </button>

        <div className={styles.avatar}>
          {user.username.charAt(0).toUpperCase()}
        </div>

        <h2>{user.username}</h2>
        <p className={styles.subtitle}>Personal Account</p>

        <div className={styles.details}>
          <div>
            <label>Username</label>
            <strong>{user.username}</strong>
          </div>

          <div>
            <label>User ID</label>
            <strong>{user.id}</strong>
          </div>

          <div>
            <label>Account Created</label>
            <strong>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-IN")
                : "Not available"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
