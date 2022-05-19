
let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;


chai.use(chaiHttp);
const url= 'http://localhost:4000';


describe('Get device count: ',()=>{
    it('should return device count', (done) => {
        chai.request(url)
        .get('/countDevices')
        .end( function(err,res){
            console.log(res.body)
            expect(res).to.have.status(200);
            expect(res.body.data.count).to.be.a('number');
            done();
        });
    });
});
   
   