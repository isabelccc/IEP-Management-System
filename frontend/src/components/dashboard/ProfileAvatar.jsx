// TODO: Build ProfileAvatar component here.
// Suggested CSS classes from App.css:
// - profile-avatar
// - profile-avatar-fallback

export default function ProfileAvatar ({userName}){

    return (
        <div>
        <div className="profile-avatar"></div>
        <p className="profile-avatar-username">{userName}</p>
        </div>
    )
}