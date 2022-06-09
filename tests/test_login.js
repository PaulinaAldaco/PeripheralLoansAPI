
let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;


chai.use(chaiHttp);
const url= 'https://rancho-back.mybluemix.net';

describe('Invalid login: ',()=>{
    it('should return false with valid username but invalid password', (done) => {
        chai.request(url)
        .get('/checkLogin?username=unusuario@ibm.com&password=123unusuario3211')
        .end( function(err,res){
            expect(res).to.have.status(200);
            expect(Object.keys(res.body.data)).to.have.lengthOf(1);
            expect(res.body.data.valid).to.be.a('boolean');
            expect(res.body.data.valid).to.be.false;
            done();
        });
    });

    it('should return false with invalid username but valid password', (done) => {
        chai.request(url)
        .get('/checkLogin?username=unusuario1@ibm.com&password=123unusuario321')
        .end( function(err,res){
            expect(res).to.have.status(200);
            expect(Object.keys(res.body.data)).to.have.lengthOf(1);
            expect(res.body.data.valid).to.be.a('boolean');
            expect(res.body.data.valid).to.be.false;
            done();
        });
    });

    it('should return false with username in password field and vice versa', (done) => {
        chai.request(url)
        .get('/checkLogin?username=123unusuario321&password=unusuario@ibm.com')
        .end( function(err,res){
            expect(res).to.have.status(200);
            expect(Object.keys(res.body.data)).to.have.lengthOf(1);
            expect(res.body.data.valid).to.be.a('boolean');
            expect(res.body.data.valid).to.be.false;
            done();
        });
    });

    it('should return false with valid username but empty password', (done) => {
        chai.request(url)
        .get('/checkLogin?username=unusuario@ibm.com&password=')
        .end( function(err,res){
            expect(res).to.have.status(200);
            expect(Object.keys(res.body.data)).to.have.lengthOf(1);
            expect(res.body.data.valid).to.be.a('boolean');
            expect(res.body.data.valid).to.be.false;
            done();
        });
    });

    it('should return false with empty username and valid password', (done) => {
        chai.request(url)
        .get('/checkLogin?username=&password=123unusuario321')
        .end( function(err,res){
            expect(res).to.have.status(200);
            expect(Object.keys(res.body.data)).to.have.lengthOf(1);
            expect(res.body.data.valid).to.be.a('boolean');
            expect(res.body.data.valid).to.be.false;
            done();
        });
    });
});

describe('Valid login: ',()=>{
    it('should return true and user info with valid username and valid password', (done) => {
        chai.request(url)
        .get('/checkLogin?username=unusuario@ibm.com&password=123unusuario321')
        .end( function(err,res){
            expect(res).to.have.status(200);
            expect(Object.keys(res.body.data)).to.have.lengthOf(4);
            expect(res.body.data.valid).to.be.a('boolean');
            expect(res.body.data.valid).to.be.true;
            expect(res.body.data.USER_ID).to.equal(10);
            expect(res.body.data.USERNAME).to.equal('unusuario@ibm.com');
            expect(res.body.data.ROLE).to.equal(1);
            done();
        });
    });
});