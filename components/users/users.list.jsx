import React from 'react';
import { Link } from 'react-router-dom';
import List from 'react-virtualized/dist/es/List';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';

export default class extends React.Component{

    _rowRenderer({index, key, style}) {

        const { users } = this.props;

        return (
            <div key={ key } style={ style }>
                <img src={ users[index].avatarUrl } width="35" />&nbsp;&nbsp;<a href="javascript:void(0)" onClick={ () => this.props.onProfileClicked(users[index].login) }>{ users[index].login }</a>
            </div>
        );
    }

    render(){
        
        const { users, total, startCursor, endCursor, hasNext, hasPrevious, isLoading } = this.props;
        const userLength = users.length;       

        return (
            <div className='user-list-wrapper'>
                <AutoSizer disableHeight>
                    {({width}) => (
                    <List
                        ref="List"
                        height={300}
                        overscanRowCount={20}
                        noRowsRenderer={() => <div >{ isLoading ? <h5 className='text-center'><i className='fas fa-circle-notch fa-spin' style={ {fontSize:14} }></i> Loading</h5>:'No users found' }</div>}
                        rowCount={userLength}
                        rowHeight={ 50 }
                        rowRenderer={this._rowRenderer.bind(this)}
                        width={width}
                    />
                    )}
                </AutoSizer>
                { total > 0 && (
                    <nav >
                        <ul className="pagination">
                            { hasPrevious && <li className="page-item"><Link className="page-link" to={ `/users/before/${startCursor}` }>Previous</Link></li> }
                            { hasNext && <li className="page-item"><Link className="page-link" to={ `/users/after/${endCursor}` }>Next</Link></li> }
                        </ul>
                    </nav>
                ) }
            </div>
        );
    }
}