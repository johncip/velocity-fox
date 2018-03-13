import '../assets/styles/style.scss';

import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import Clubhouse from 'clubhouse-lib';
import Icon from '../assets/pretty.png';
import secrets from 'Config/secrets.js';

const PROJECT_IDS = {
  web_app: 5,
}

const WORKFLOW_STATES = {
  500000014: 'Unscheduled',
  500000011: 'Ready for Development',
  500007040: 'Next Up',
  500000015: 'In Development',
  500000010: 'Ready for Review',
  500000012: 'Completed'
}

const Heading = props =>
  <h1 className="siteHeading">
    <img src={Icon} height={50} />
    &nbsp;
    Velocity Fox
  </h1>

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
        {Object.keys(this.props.groupedStories).map((ownerId) => {
          return (
            <div key={ownerId}>
              <h2>StoryList</h2>
              <h2>{ownerId}</h2>
              <StoryList stories={this.props.groupedStories[ownerId]}/>
            </div>
          );
        })}
      </div>
    );
  }
}

const StoryList = ({stories}) =>
  <ul className="storyList">{
    stories.map((x) =>
      <li key={x.id}><Story {...x} /></li>
    )
  }</ul>

const Story = ({name, workflow_state_id, story_type, estimate}) =>
  // estimate
  // description
  <div className="story">
    <span className="story--workflowState">
      {`[${WORKFLOW_STATES[workflow_state_id]}]`}
    </span>
    <span className="story--storyType">
      {`[${story_type}]`}
    </span>
    <span className="story--name">
      {name}
    </span>
    {estimate ?
      <span className="story--estimate">
        {`[${estimate}]`}
      </span>
      : null}
  </div>

const clubhouse = Clubhouse.create(secrets.clubhouse);

// TODO: "duplicate" story data for multiple owners
const groupStories = (stories) => {
  const grouped = _.groupBy(stories, x => x.owner_ids);
  delete grouped[''];

  Object.keys(grouped).forEach((ownerId) => {
    console.log(ownerId);
    grouped[ownerId] = grouped[ownerId].filter(x => {
      if (WORKFLOW_STATES[x.workflow_state_id] == 'Completed') {
        return false;
      }
      if (WORKFLOW_STATES[x.workflow_state_id] == 'Unscheduled') {
        return false;
      }
      return true;
    });
  });

  return grouped;
}

const $target = $('<div>').addClass('.js-target')
$(document.body).append($target)

clubhouse.listStories(PROJECT_IDS.web_app).then((response) => {
  const groupedStories = groupStories(response);
  return ReactDOM.render(<Root groupedStories={groupedStories}/>, $target[0]);
});
