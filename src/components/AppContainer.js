import React from "react"

import debounce from 'lodash.debounce';
import LoaderImage from '../loading-buffering.gif';
import headerLogo from '../logo-hn-search-a822432b.png';

class AppContainer extends React.Component {

	constructor( props ) {
		super( props );

		this.state = {
			searchQuery: '',
			searchResults: [],
			loading: false,
			totalPages: 0,
			currentPageNo: 0,
		};
	}

	/**
	 * Get the search results and update the state with the result.
	 *
	 * @param {String} searchQuery Search Query.
     * @param {int} updatedPageNo Updated Page No.
	 *
	 */
	getSearchResults = ( searchQuery, updatedPageNo = '' ) => {
		const pageNumber = updatedPageNo ? `&page=${updatedPageNo}` : '';
		const searchUrl = `http://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=10&query=${searchQuery}${pageNumber}`;

        fetch(searchUrl) 
            .then(response => {
                return response.json();
            })
            .then(jsonData => {
                this.setState( {
			        searchResults: jsonData.hits,
			        totalPages: jsonData.nbPages,
			        currentPageNo: updatedPageNo,
			        loading: false
	        	} )
            })
        .catch(error => { 
            this.setState({
					loading: false,
					})
        });
    };

    /**
	 * Handle search query as it is changed
	 *
	 * @param event Action triggering the change
	 *
	 */
    handleOnInputChange1 = ( event ) => {
		const searchQuery = event.target.value;
		if ( ! searchQuery ) {
			this.setState( { searchQuery, searchResults: [], totalPages: 0 } );
		} else {
			this.setState( { searchQuery, loading: true }, () => {
				this.getSearchResults( searchQuery, 1 );
			} );
		}
	};

    /**
	 * Handle getting search results. 
	 * Will trigger .5seconds  after last input
	 *
	 * @param text Text being changed via handleOnInputChange 
	 *
	 */
	debouncedInputQuery = debounce(text => {
		const { searchQuery } = this.state;
		if ( ! searchQuery ) {
			this.setState( { searchQuery, searchResults: [], totalPages: 0 } );
		} else {
			this.setState( { searchQuery, loading: true }, () => {
				this.getSearchResults( searchQuery, 1 );
			} );
		}
	}, 500);

	/**
	 * Handle search query as it is changed
	 *
	 * @param event Action triggering the change
	 *
	 */
	handleOnInputChange = ( event ) => {
		this.setState({searchQuery: event.target.value })
		this.debouncedInputQuery(event.target.value);
	}

    /**
	 * Handle Back Page Button. Processing to get results for prior page
	 *
	 * @param event Action triggering the change
	 *
	 */
	handleLeftButtonClick = ( event ) => {
		event.preventDefault();
		const { searchQuery } = this.state;
		const updatedPageNo = this.state.currentPageNo - 1
		this.setState( { loading: true }, () => {
			this.getSearchResults( searchQuery, updatedPageNo );
		} )
	};

	/**
	 * Handle Next Page Button. Processing to get results for next page
	 *
	 * @param event Action triggering the change
	 *
	 */
	handleRightButtonClick = ( event ) => {
		event.preventDefault();
		const { searchQuery } = this.state;
		const updatedPageNo = this.state.currentPageNo + 1
		this.setState( { loading: true }, () => {
			this.getSearchResults( searchQuery, updatedPageNo );
		} )
	 };

    /**
	 * Function to render the Search Results Conainter
	 *
	 */
	renderSearchResults = () => {
		const { searchResults } = this.state;

		if ( Object.keys( searchResults ).length && searchResults.length ) {
			return (
				<div className="results-container">
					{ searchResults.map(( result, index) => {
						return (
							<div key={index} className="results-item">
								<h4>{result.title}</h4>
								<p><a href={result.url} target="_blank" rel="noopener noreferrer">{result.url}</a></p>
                                <p>Author: {result.author}</p>
							</div>
						)
					} ) }
				</div>
			)
		}
	};

	/**
	 * Function to render the Search Navigation Conainter
	 *
	 */
	renderNavigation = (currentPageNo, totalPages, loading) => {
		const { searchResults } = this.state;

		if ((totalPages !== 0 ) &&  (searchResults.length !==0)) {

			const showPrevButton = currentPageNo !== 1;
			const showNextButton = currentPageNo < totalPages;

			return (
			<div className="result-navigation">
				<div className="left-button">
					<button
						className={
							`nav-link 
							${ showPrevButton ? 'show' : 'hide'}
							${ loading ? 'greyed-out' : ''
							}`
						}
						onClick={ this.handleLeftButtonClick }
					>
						Previous Page
					</button>
				</div>
				<div className="pages">
					<h3> Page {currentPageNo} of {totalPages}</h3>
				</div>
				<div className="right-button">
					<button
						className={
							`nav-link 
							${ showNextButton ? 'show' : 'hide'}
							${ loading ? 'greyed-out' : '' }
							`}
						onClick={ this.handleRightButtonClick }
					>
						Next Page
					</button>
				</div>
			</div>
			)
		}
	};

    render() {
        const { searchQuery, loading, currentPageNo, totalPages } = this.state;

        return (
            <div className="container">
			{/*	Heading */}
			<div className="header">
					<img src={headerLogo} className='headerlogo' alt="logo" width="50" height="50"/>
					<h2 className="heading">Hacker News Search Client</h2>
			</div>
			{/* Search Input */}
			<div className="search-container">
				<input
					type="text"
					name="query"
					value={ searchQuery }
					id="search-input"
					placeholder="Search..."
					onChange={this.handleOnInputChange}
				/>
			</div>
            {/*	Loader */}
			<img src={ LoaderImage } className={`search-loading ${ loading ? 'show' : 'hide' }`} alt="loader"/>    
            {/*	Result */}
			<div className="results">
				{ this.renderSearchResults() }
			</div>
			{/*	Search Results Navigation */}
			<div className="navigation">
				{ this.renderNavigation(currentPageNo, totalPages, loading) }		
			</div>
			</div>
        )
    }
}

export default AppContainer