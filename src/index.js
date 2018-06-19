import '../node_modules/lato-font/scss/lato-font.scss';
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
  document.body.classList.add('watermarkedBody');
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
    this.state = {stories: null, filter: FILTER.inProgress};
  }

  componentDidMount() {
    const clubhouseClient = Clubhouse.create(secrets.clubhouse);
    let stories = [];
    clubhouseClient.listStories(PROJECT_IDS.web_app).then((resp) => {
      stories = stories.concat(resp);
      this.setState({stories});
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

  renderStoryList() {
    return (
      <StoryList
        stories={this.state.stories}
        filter={this.state.filter}
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
          {this.state.stories ? this.renderStoryList() : <Loading />}
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
        <LabelCount labels={this.props.labels} />
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

class LabelCount extends React.PureComponent {
  render() {
    return (
      <span className='story--labelCount'>
        {this.props.labels && this.props.labels.length}
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
