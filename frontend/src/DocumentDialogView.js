import React from 'react'
import axios from 'axios';
import {
	Backdrop,
	Button, CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle
} from '@material-ui/core';

export default class DocumentDialogView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			document: { url: '', rendition: '' },
			downloadHref: '',
			fileName: ''
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.open !== this.props.open) {
			if (this.props.open) {
				this.setState({
					downloadHref: this.props.downloadHref
				});
				this.downloadDocumentContents(this.props.downloadHref);
			}
		}
	}

	closeDialog() {
		this.setState({
			document: { url: '', rendition: '' },
			downloadHref: '',
			fileName: ''
		});
		this.props.onClose();
	}

	getContentId(url) {
		return url.replace(/^.*\/content\//, "");
	}

	downloadDocument(downloadHref) {
		axios.defaults.baseURL = '';
		// Calling /api/css/downloadcontent
		axios({
			method: 'get',
			url: '/api/css/downloadcontent/' + this.getContentId(downloadHref),
			responseEncoding: 'binary',
			responseType: 'arraybuffer'
		}).then(file => {
			this.setState({
				document: { rendition: new Buffer(file.data).toString('base64') },
			})
		}).catch(error => {
			alert("Error " + error.response.status + " in downloading: " + error.response.statusText);
		});
	}

	downloadDocumentContents(url) {
		let urlObj = new URL(url);

		axios({
			method: 'get',
			url: '/api' + urlObj.pathname
		}).then(contents => {
			if (contents.data && contents.data._embedded.collection) {
				contents.data._embedded.collection.forEach(rendition => {
					if (rendition.mime_type === 'application/vnd.blazon+json') {
						this.downloadRendition(rendition._links['urn:eim:linkrel:download-media'].href);
					}
				});				
			}
		}).catch(error => {
			alert("Error " + error.response.status + " in downloading: " + error.response.statusText);
		});
	}

	downloadRendition(url) {
		let urlObj = new URL(url);

		axios({
			method: 'get',
			url: '/api/' + urlObj.pathname
		})
		.then(rendition => {
			if (rendition.data) {
				this.setState({
					document: { rendition: rendition.data.id },
				})
				this.renderDocument(rendition);
		}
		})
		.catch();
	}

	renderDocument(rendition){
		if (rendition.data && window['bravaapi']) {
			console.log('Rendering with viewer:');
			console.log(JSON.stringify(rendition));
			window['bravaapi'].setHttpHeaders({ Authorization: "Bearer token"});
			window['bravaapi'].addPublication(rendition.data, true);
			window['bravaapi'].render("bravaViewRoot");
		} else {
			console.log("no rendition or viewer available");
		}
	}

	render() {
		if (this.state.document.rendition) {
			return (
				<Dialog
					fullWidth={true}
					maxWidth='lg'
					open={this.props.open}
					aria-labelledby="form-dialog-title">
					<DialogTitle id="customized-dialog-title">{this.state.fileName}</DialogTitle>
					<DialogContent>
						<div id="bravaViewRoot" style={{height: '700px'}}></div>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => { this.closeDialog() }} variant="contained" color="primary">
							Close
					</Button>
					</DialogActions>
				</Dialog>
			)
		}
		else {
			return (
				<Backdrop style={{zIndex: 9999}} open={this.props.open}>
					<CircularProgress color="inherit"/>
				</Backdrop>
			)
		}

	}
}
