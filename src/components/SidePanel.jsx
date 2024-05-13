import React from "react";

export const SidePanel = ({ shipsPassed, portClicked }) => {
  return (
    <div className="sidebarStyle">
      <h2 style={{ color: 'green'}}>{`Port Name:- ${portClicked.title}` }</h2>
      { shipsPassed.length ? <h4>{`Ships passed through this Port are:-`}</h4> : null }
      {
        shipsPassed.length ?
        shipsPassed.map((shipName) => {
            return <li style={{color: 'blue'}}>{shipName}</li>
          }) :
          <div>
            No Ships Passed through this port in last seven days.
          </div>

      }
    </div>
  )

}