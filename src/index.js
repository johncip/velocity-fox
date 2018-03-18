import '../assets/styles/style.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import secrets from 'Config/secrets.js';
import workflowStates from './workflowStates.js';

// ---------------------------------------------------------------------------------------
// index
// ---------------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const target = document.createElement('div');
  document.body.appendChild(target)
  ReactDOM.render(<AppRoot />, target);
});


// ---------------------------------------------------------------------------------------
// AppRoot
// ---------------------------------------------------------------------------------------

import Clubhouse from 'clubhouse-lib';

const PROJECT_IDS = {
  web_app: 5,
  dev_ops: 16,
  pandagrader: 3154
}

const NULL_OWNER_ID = 'no-owner';

// Given a list of stories & called from Array.reduce, creates a map: {owner_id => [stories]}
const indexStoriesByOwner = (result, story) => {
  if (!story.owner_ids.length) {
    story.owner_ids.push(NULL_OWNER_ID);
  }

  story.owner_ids.forEach((id) => {
    if (!result[id]) {
      result[id] = [];
    }
    result[id].push(story);
  });

  return result;
};

const FILTER = {
  unscheduled: 'unscheduled',
  inProgress: 'inProgress',
  completed: 'completed',
  archived: 'archived'
};

class AppRoot extends React.PureComponent {
  static buttonCaptions = {
    [FILTER.unscheduled]: 'Unscheduled',
    [FILTER.inProgress]: 'In Progress',
    [FILTER.completed]: 'Completed',
    [FILTER.archived]: 'Archived'
  };

  constructor(props) {
    super();
    this.state = {groupedStories: null, filter: FILTER.inProgress};
  }

  componentDidMount() {
    const clubhouseClient = Clubhouse.create(secrets.clubhouse);
    let stories = [];

    // TODO: clean up
    clubhouseClient.listStories(PROJECT_IDS.web_app).then((resp) => {
      stories = stories.concat(resp);

      clubhouseClient.listStories(PROJECT_IDS.dev_ops).then((resp) => {
        stories = stories.concat(resp);

        clubhouseClient.listStories(PROJECT_IDS.pandagrader).then((resp) => {
          stories = stories.concat(resp);

          const groupedStories = stories.reduce(indexStoriesByOwner, {});
          this.setState({groupedStories});
        });
      });
    });
  }

  renderFilterButtons() {
    return (
      <div>
        {Object.keys(FILTER).map(filter =>
          <FilterButton
            key={filter}
            onClick={x => this.setState({filter})}
            active={this.state.filter === filter}
          >
            {this.constructor.buttonCaptions[filter]}
          </FilterButton>)}
      </div>
    );
  }

  renderMemberList() {
    return (
      <MemberList
        members={members}
        groupedStories={this.state.groupedStories}
        filter={this.state.filter}
        showUnowned={false}
      />
    );
  }

  render() {
    return (
      <div>
        <Header>
        {this.renderFilterButtons()}
        </Header>
        <div className="content">
          {this.state.groupedStories ? this.renderMemberList() : <Loading />}
        </div>
      </div>
    );
  }
}

class FilterButton extends React.PureComponent {
  classes() {
    return classNames('filterButton', {
      'filterButton-active': this.props.active
    });
  }

  render() {
    return (
      <button
        className={this.classes()}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    );
  }
}

const Loading = props =>
  <div className="loading">
    <div className="lds-dual-ring" />
  </div>

import foxIcon from '../assets/pretty.png';

const Header = props =>
  <header className="header">
    {props.children}
    <img src={foxIcon} height={50} />
  </header>


// -------------------------------------------------------------------------------------------
// MemberList
// -------------------------------------------------------------------------------------------

import members from './members.js';

class MemberList extends React.PureComponent {
  render() {
    return (
      <div>
        {Object.keys(this.props.groupedStories).map((ownerId) => {
          const stories = this.props.groupedStories[ownerId];

          if (!this.props.showUnowned && ownerId === NULL_OWNER_ID) {
            return null;
          }

          return (
            <StoryList
              key={ownerId}
              ownerId={ownerId}
              stories={stories}
              filter={this.props.filter}
            />
          );
        })}
      </div>
    );
  }
}

const getOwnerName = (ownerId) => {
  const member = members[ownerId];
  if (!member) {
    return ownerId;
  }
  return '@' + member.mention_name;
};

class OwnerHeader extends React.PureComponent {
  avatarUrl() {
    const {display_icon_url, gravatar_hash} = this.props.owner;

    if (display_icon_url) {
      return display_icon_url;
    }
    return `https://www.gravatar.com/avatar/${gravatar_hash}`;
  }

  render() {
    return (
      <div className="ownerHeader">
        <img className="ownerHeader--avatar" src={this.avatarUrl()} />
        <h2 className="ownerHeader--mentionName">{'@' + this.props.owner.mention_name}</h2>
        {this.props.children}
      </div>
    );
  }
}

// -------------------------------------------------------------------------------------------
// Story Components
// -------------------------------------------------------------------------------------------

// TODO: hide stories here
class StoryList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.renderStory = this.renderStory.bind(this);
  }

  filteredStories() {
    const stories = this.props.stories;

    switch(this.props.filter) {
      case FILTER.unscheduled:
        return stories.filter(x => workflowStates[x.workflow_state_id] === 'Unscheduled');

      case FILTER.inProgress:
        return stories.filter((x) => {
          if (x.archived) {
            return false;
          } else if (workflowStates[x.workflow_state_id] === 'Ready for Dev') {
            return true;
          } else if (workflowStates[x.workflow_state_id] === 'Next Up') {
            return true;
          } else if (workflowStates[x.workflow_state_id] === 'In Development') {
            return true;
          } else if (workflowStates[x.workflow_state_id] === 'Ready for Review') {
            return true;
          } else {
            return false;
          }
        });

      case FILTER.completed:
        return stories.filter(x => workflowStates[x.workflow_state_id] === 'Completed');

      case FILTER.archived:
        return stories.filter(x => x.archived);

      default:
        return stories;
    }
  }

  renderStory(story) {
    return <Story key={story.id} {...story} />;
  }

  render() {
    const stories = this.filteredStories();
    if (!stories.length) { return null; }

    return (
      <div className="storyList">
        <OwnerHeader owner={members[this.props.ownerId]}></OwnerHeader>
        <ul className="storyList--list">
          {stories.map(this.renderStory)}
        </ul>
      </div>
    );
  }
}

class Story extends React.PureComponent {
  classes() {
    return classNames('story', {
      'story-archived': this.props.archived
    });
  }

  render() {
    const url = `https://app.clubhouse.io/gradescope/story/${this.props.id}`
    return (
      <li className={this.classes()}>
        <span className="story--state">
          {workflowStates[this.props.workflow_state_id]}
        </span>
        <EpicBadge epicId={this.props.epic_id} />
        <Estimate points={this.props.estimate} />
        <StoryType type={this.props.story_type} />
        <span className="story--id">
          <a href={url}>
            {'#' + this.props.id}
          </a>
        </span>
        <span className="story--name">
          <a href={url}>
            {this.props.name}
          </a>
        </span>
      </li>
    );
  }
}

class Estimate extends React.PureComponent {
  classes() {
    return classNames('story--estimate', {
      'story--estimate-none': !this.props.points
    });
  }

  render() {
    return (
      <span className={this.classes()}>
        {this.props.points || '?'}
      </span>
    );
  }
}

class StoryType extends React.PureComponent {
  classes() {
    return `story--type story--type-${this.props.type}`;
  }

  render() {
    return <span className={this.classes()}>{this.props.type}</span>;
  }
}

class EpicBadge extends React.PureComponent {
  classes() {
    return classNames('story--epicBadge', {
      'story--epicBadge-inEpic': this.props.epicId,
      'story--epicBadge-notInEpic': !this.props.epicId
    });
  }

  render() {
    return (
      <span className={this.classes()}>
        {this.props.epicId ? 'e' : '-'}
      </span>
    );
  }
}
