/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import graphQLFetch from './graphQLFetch.js';
import Toast from './Toast.jsx';

export default class IssueDetail extends React.Component {
  constructor() {
    super();

    this.showSuccess = this.showSuccess.bind(this);
    this.showError = this.showError.bind(this);
    this.dismissToast = this.dismissToast.bind(this);

    this.state = {
      issue: {},
      toastVisible: false,
      toastMessage: ' ',
      toastType: 'info',
    };
  }

  componentDidMount() {
    const { match: { params: { id } } } = this.props;
    if (id) this.loadData(id);
  }

  componentDidUpdate(prevProps) {
    const { match: { params: { id: prevId } } } = prevProps;
    const { match: { params: { id: newId } } } = this.props;
    if (newId !== prevId) this.loadData(newId);
  }

  async loadData(id) {
    const query = `
      query Issue($id: Int!) {
        issue(id: $id) {
          id
          description
        }
      }
    `;

    const data = await graphQLFetch(query, { id }, this.showError);
    if (data) this.setState({ issue: data.issue });
  }

  showSuccess(message) {
    this.setState({
      toastVisible: true, toastMessage: message, toastType: 'success',
    });
  }

  showError(message) {
    this.setState({
      toastVisible: true, toastMessage: message, toastType: 'danger',
    });
  }

  dismissToast() {
    this.setState({
      toastVisible: false,
    });
  }

  renderIssue() {
    const { issue: { id, description } } = this.state;

    return (
      <React.Fragment>
        <h3>Description</h3>
        (Issue ID:
        {` ${id}.)`}
        <br />
        <pre>{description || 'N/A'}</pre>
      </React.Fragment>
    );
  }

  render() {
    const { issue: { id } } = this.state;

    const { toastVisible, toastType, toastMessage } = this.state;

    return (
      <div>
        {id ? this.renderIssue() : ''}
        <Toast
          needToShow={toastVisible}
          onDismiss={this.dismissToast}
          bsStyle={toastType}
        >
          {toastMessage}
        </Toast>
      </div>
    );
  }
}
