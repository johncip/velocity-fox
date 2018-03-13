import '../assets/styles/style.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import secrets from 'Config/secrets.js';
import workflowStates from './workflowStates.js';

// -------------------------------------------------------------------------------------------
// MemberList
// -------------------------------------------------------------------------------------------

import members from './members.js';

const getOwnerName = (ownerId) => {
  const member = members[ownerId];
  if (!member) {
    return ownerId;
  }
  return '@' + member.mention_name;
};

const getOwnerNames = (ownerStr) => {
  const ownerIds = ownerStr.split(',');
  return ownerIds.map(getOwnerName).join(', ');
};

class MemberList extends React.PureComponent {
  render() {
    return (
      <div>
        {Object.keys(this.props.groupedStories).map((ownerStr) => {
          const ownerNames = getOwnerNames(ownerStr);
          return (
            <div className="storyList" key={ownerStr}>
              <h2 class="ownerName">{ownerNames}</h2>
              <StoryList stories={this.props.groupedStories[ownerStr]} />
            </div>
          );
        })}
      </div>
    );
  }
}

// -------------------------------------------------------------------------------------------
// Misc Components
// -------------------------------------------------------------------------------------------

import foxIcon from '../assets/pretty.png';

const Loading = props =>
  <div className="loading">
    <div className="lds-dual-ring" />
  </div>

const Header = props =>
  <header className="header">
    <img src={foxIcon} height={50} />
  </header>

// TODO: expand props
const StoryList = props =>
  <ul className="storyList--list">{
    props.stories.map((x) =>
      <li key={x.id}><Story {...x} /></li>
    )
  }</ul>;

// TODO: add description
const Story = (props) =>
  <div className="story">
    <span className="story--id">
      {'#' + props.id}
    </span>
    <span className="story--workflowState">
      {workflowStates[props.workflow_state_id]}
    </span>
    <Estimate points={props.estimate} />
    <StoryType type={props.story_type} />
    <span className="story--name">{props.name}</span>
  </div>;

const Estimate = ({points}) => {
  if (points) {
    return <span className="story--estimate">{points}</span>
  } else {
    return <span className="story--estimate story--estimate-none">{points || '\u00A0'}</span>
  }
};

// TODO classnames
// TODO switch
const StoryType = ({type}) => {
  if (type == 'chore') {
    return <span className="story--type story--type-chore">{type}</span>
  } else if (type == 'feature') {
    return <span className="story--type story--type-feature">{type}</span>
  } else {
    return <span className="story--type story--type-bug">{type}</span>
  }
};

// ---------------------------------------------------------------------------------------
// AppRoot
// ---------------------------------------------------------------------------------------

import _ from 'lodash';
import Clubhouse from 'clubhouse-lib';

const PROJECT_IDS = {
  web_app: 5,
}

// TODO: "duplicate" story data for multiple owners
class AppRoot extends React.Component {
  constructor(props) {
    super();
    this.state = {groupedStories: null};
  }

  groupStories(stories) {
    const grouped = _.groupBy(stories, x => x.owner_ids);
    delete grouped[''];

    Object.keys(grouped).forEach((ownerId) => {
      grouped[ownerId] = grouped[ownerId].filter(x => {
        if (workflowStates[x.workflow_state_id] == 'Completed') {
          return this.props.showCompleted;
        }
        if (workflowStates[x.workflow_state_id] == 'Unscheduled') {
          return this.props.showUnscheduled;
        }
        return true;
      });
    });

    return grouped;
  }

  componentDidMount() {
    const clubhouseClient = Clubhouse.create(secrets.clubhouse);
    clubhouseClient.listStories(PROJECT_IDS.web_app).then((response) => {
      this.setState({groupedStories: this.groupStories(response)});
    });
  }

  renderMemberList() {
    return (
      <MemberList
        members={members}
        groupedStories={this.state.groupedStories}
        showUnscheduled={false}
        showCompleted={false}
      />
    );
  }

  render() {
    return (
      <div>
        <Header />
        <div class="content">
          {this.state.groupedStories ? this.renderMemberList() : <Loading />}
        </div>
      </div>
    );
  }
}

// ---------------------------------------------------------------------------------------
// index
// ---------------------------------------------------------------------------------------

import $ from 'jquery';

$(document).ready(() => {
  const $target = $('<div>').addClass('.js-target')
  $(document.body).append($target)
  ReactDOM.render(<AppRoot />, $target[0]);
});
