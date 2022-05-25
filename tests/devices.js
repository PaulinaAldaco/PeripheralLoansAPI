
let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;


chai.use(chaiHttp);
const url= 'http://localhost:4000';


describe('Test device count: ',()=>{
    it('should return device count', (done) => {
        chai.request(url)
        .get('/countDevices')
        .end( function(err,res){
            //console.log(res.body)
            expect(res).to.have.status(200);
            expect(res.body.data.count).to.be.a('number');
            done();
        });
    });
});
   
describe('Test getting devices with pagination: ',()=>{
    it('should return first 10 devices', (done) => {
        chai.request(url)
        .post('/getDevices')
        .send({limit:10, page: 1})
        .end( function(err,res){
            //console.log(res.body)
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.lengthOf(10);
            expect(res.body.data[0]['ID']).to.be.a('number').that.equals(1);
            expect(res.body.data[9]['ID']).to.be.a('number').that.equals(10);
            done();
        });
    });

    it('should return first 15 devices, page 2', (done) => {
        chai.request(url)
        .post('/getDevices')
        .send({limit:15, page: 2})
        .end( function(err,res){
            //console.log(res.body)
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.lengthOf(15);
            expect(res.body.data[0]['ID']).to.be.a('number').that.equals(16);
            expect(res.body.data[14]['ID']).to.be.a('number').that.equals(30);
            done();
        });
    });
});

describe('Test check device availability: ',()=>{
    it('should return 10 available, 0 unavailable', (done) => {
        chai.request(url)
        .post('/checkDeviceAvailability')
        .send({"request_params": [
            {"user_id": 1, "device_id": 31},
            {"user_id": 1, "device_id": 32},
            {"user_id": 1, "device_id": 33},
            {"user_id": 1, "device_id": 34},
            {"user_id": 1, "device_id": 35},
            {"user_id": 1, "device_id": 36},
            {"user_id": 1, "device_id": 37},
            {"user_id": 1, "device_id": 38},
            {"user_id": 1, "device_id": 39},
            {"user_id": 1, "device_id": 40}
        ]})
        .end( function(err,res){
            console.log(res.body)
            expect(res).to.have.status(200);
            //expect(res.body.data).to.have.lengthOf(10);
            //expect(res.body.data[0]['ID']).to.be.a('number').that.equals(1);
            //expect(res.body.data[9]['ID']).to.be.a('number').that.equals(10);
            done();
        });
    });

    it('should return 0 available, 10 unavailable', (done) => {
        chai.request(url)
        .post('/checkDeviceAvailability')
        .send({"request_params": [
            {"user_id": 1, "device_id": 1},
            {"user_id": 1, "device_id": 2},
            {"user_id": 1, "device_id": 3},
            {"user_id": 1, "device_id": 4},
            {"user_id": 1, "device_id": 5},
            {"user_id": 1, "device_id": 6},
            {"user_id": 1, "device_id": 7},
            {"user_id": 1, "device_id": 8},
            {"user_id": 1, "device_id": 9},
            {"user_id": 1, "device_id": 10}
        ]})
        .end( function(err,res){
            console.log(res.body)
            expect(res).to.have.status(200);
            expect(res.body.data.available).to.have.lengthOf(0);
            expect(res.body.data.unavailable).to.equals([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            //expect(res.body.data[0]['ID']).to.be.a('number').that.equals(1);
            //expect(res.body.data[9]['ID']).to.be.a('number').that.equals(10);
            done();
        });
    });
});