import Github from '../utilities/github';
import testProps from '../test.props';

describe('GithubApi',() =>{

    const githubApi = new Github( testProps.testOAuth );

    beforeEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    it('should return user profile for current user', done =>{

        const keys = ['avatarUrl', 'username', 'id', 'token'];

        githubApi.getCurrentUserDetail().then( user =>{
            expect(typeof user).toBe('object');

            keys.forEach( key =>{
                expect( user[key] ).toBeTruthy();
            });
            done();
        }, err =>{
            expect(err).toBeUndefined();
            done();
        });
    });

    it('should return non-empty user list and available end cursor', done =>{

        githubApi.getUsers().then( data =>{
            expect(data.search.edges.length).toBeGreaterThan(0);
            expect(data.search.pageInfo.endCursor).toBeTruthy();
            done();
        }, err=>{
            expect(err).toBeUndefined();
            done();
        });
    });

    it('should return user profile for specific user', done =>{

        const keys = ['bio', 'avatarUrl', 'company','email', 'location','login', 'url', 'name', 'websiteUrl', 'following','gists', 'repositories'];

        githubApi.getProfile( testProps.testLogin ).then( user =>{
            expect( user.login ).toBe(testProps.testLogin);
            keys.forEach( key =>{
                expect( user[key] ).toBeDefined();
            });
            done();
        }, err =>{
            expect(err).toBeUndefined();
            done();
        });

    });

    it('should return non-empty user repositories object', done =>{

        const keys = ['']

        githubApi.getUserRepositories( testProps.testLogin , 50 )
                 .then( data =>{
                    const { user } = data;
                    expect(user.repositories.nodes.length).toBeGreaterThan(0);
                    expect(user.repositories.pageInfo.endCursor).toBeTruthy();
                    done();
                }, rejected =>{
                    expect(rejected).toBeUndefined();
                    done();
                });

    });

});