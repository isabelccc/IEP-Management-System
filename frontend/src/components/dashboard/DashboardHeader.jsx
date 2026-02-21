import ProfileAvatar from "./ProfileAvatar";
function DashboardHeader({ user }) {
    return (
      <header className="dashboard-header">
        <ProfileAvatar userName={user?.firstName}/>
        <h2>Welcome, {user?.firstName}</h2>
  
       
      </header>
    );
  }
  
export default DashboardHeader;