import React from 'react';
import './styles/AdminApp.css';


class AdminApp extends React.Component {
  render() {
    return (
    <div>
      <h1>
        Welcome to the front desk of {this.props.match.params.placeId}!
      </h1>
      <main>
        Main area
      </main>
      <aside>
        Sidebar
      </aside>
    </div>
    );
  }
}

// export a single class
export default AdminApp;