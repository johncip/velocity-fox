import '../assets/styles/style.scss';

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Clubhouse from 'clubhouse-lib';
import Icon from '../assets/pretty.png';
import secrets from 'Config/secrets.js';


const Heading = props =>
  <h1 className="siteHeading">
    <img src={Icon} height={50} />
    &nbsp;
    Velocity Fox
  </h1>

// TODO: exclude .disabled
// TODO: exclude profile.deactivated ?
const MemberList = ({members}) =>
  <ul className="memberList">{
    members.map((m) =>
      <li key={m.id}><Member {...m} /></li>
    )
  }</ul>

const Member = props =>
  <ul>
    <li>{`entity type: ${props.entity_type}`}</li>
    <li>{`id: ${props.id}`}</li>
    <li>{`role: ${props.role}`}</li>
    <li>{`disabled: ${props.disabled}`}</li>
    <li>profile: <Profile {...props.profile} /></li>
  </ul>

const Profile = props =>
  <ul>
    <strong><li>{`${props.name}`}</li></strong>
    <strong><li>{`@${props.mention_name}`}</li></strong>
    <li>{`email_address: ${props.email_address}`}</li>
    <li>{`entity_type: ${props.entity_type}`}</li>
    {/* <li> */}
    {/*   <img src={`https://www.gravatar.com/avatar/${props.gravatar_hash}.jpg`}/> */}
    {/* </li> */}
    <li>{`id: ${props.id}`}</li>
  </ul>

class Root extends React.PureComponent {
  render() {
    return (
      <div>
        <Heading/>
        <MemberList members={this.props.members}/>
      </div>
    );
  }
}

const clubhouse = Clubhouse.create(secrets.clubhouse);

const $target = $('<div>').addClass('.js-target')
$(document.body).append($target)

clubhouse.listMembers().then((x) =>
  ReactDOM.render(<Root members={x}/>, $target[0])
);

// Dibyo member ID: 582f62b5-acb0-454b-bafd-04e77f0b460e
// Dibyo profile ID: 582f62b5-5836-48dd-944a-d8ef1681ae1a
