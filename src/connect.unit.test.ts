import express from 'express';
import  sinon from 'sinon';
import  sinonChai from 'sinon-chai';
import  chai from 'chai';
import  _ from 'lodash';

import { connect, TMapRequestToArgs } from './connect';

chai.use(sinonChai);
const { expect } = chai;

describe('connect', () => {
  const req = express.request;
  const res = express.response;
  let next: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  let controller: sinon.SinonStub;
  let mapRequestToArgs: TMapRequestToArgs;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    controller = sandbox.stub();
    next = sandbox.stub();
    mapRequestToArgs = '';
    req.body = { id: 1234, name: 'samsung' };
    sandbox.stub(res, 'status').returns(res);
    sandbox.stub(res, 'sendStatus');
    sandbox.stub(res, 'send');
    sandbox.stub(res, 'json');
  })
  
  afterEach(() => {
    sandbox.restore();
  });
  
  context('mapRequestToArgs is an array of paths', () => {
    beforeEach(() => {
      mapRequestToArgs = ['req.body.id', 'req.body.name'];
    });

    it('should use the paths to get args from req object', async () => {
      sandbox.spy(_, 'get');

      await connect(mapRequestToArgs)(controller)(req, res, null);

      expect(_.get).to.have.been.calledWith(req, 'body.id');
      expect(_.get).to.have.been.calledWith(req, 'body.name');
    });

    it('should pass those args to the controller ', async () => {
      await connect(mapRequestToArgs)(controller)(req, res, null);
      expect(controller).to.have.been.calledWith(1234, 'samsung');
    })
  });
  
  context('mapRequestToArgs is a function', () => {
    beforeEach(() => {
      mapRequestToArgs = sandbox.stub().returns([1234, 'samsung']);
    });
    
    it('should pass req to that function', async () => {
      await connect(mapRequestToArgs)(controller)(req, res, null);
      expect(mapRequestToArgs).to.have.been.calledWith(req);
    });
    
    it('should pass correct args to the controller', async () => {
      await connect(mapRequestToArgs)(controller)(req, res, null);
      expect(controller).to.have.been.calledWith(1234, 'samsung');

    });
  });

  context('mapRequesToArgs is a string', () => {
    beforeEach(() => {
      mapRequestToArgs = 'req.body.id';
    });

    it('should use the path to get arg from req object', async () => {
      sandbox.spy(_, 'get');
      await connect(mapRequestToArgs)(controller)(req, res, null);
      expect(_.get).to.have.been.calledWith(req, 'body.id');
    });

    it('should pass that arg to the controller', async () => {
      await connect(mapRequestToArgs)(controller)(req, res, null);
      expect(controller).to.have.been.calledWith(1234);
    });
  });
  
  context('mapRequesToArgs is a neither a string, array, or function', () => {
    beforeEach(() => {
      mapRequestToArgs = null;
    });

    it('should throw an error', async () => {
        await connect(mapRequestToArgs)(controller)(req, res, next);
        expect(next).to.be.called;
        expect(next.firstCall.args[0])
          .to.be.instanceOf(Error)
          .with.property('message')
          .that.contains('mapRequestToArgs must be one of');
    });
  });

  context('controller resolves to something empty (null, undefined, etc.)', () => {
    beforeEach(() => {
      controller.resolves();
    });

    it('should only send back the status', async () => {
      await connect(mapRequestToArgs)(controller)(req, res, null);
      expect(res.sendStatus).to.have.been.calledOnce;
    });
  });
  
  context('controller resolves to something non-empty value', () => {
    beforeEach(() => {
      controller.resolves({ something: 'important' });
    });

    it('should send back the status and return value from controller', async () => {
      await connect(mapRequestToArgs)(controller)(req, res, null);
      expect(res.status).to.have.been.calledOnce;
      expect(res.send).to.have.been.calledOnce;
    });
  });
  
  context('controller throws an error', () => {
    beforeEach(() => {
      controller.throws(new Error('a message'));
    })
    
    it('should call next with the error', async () => {
      await connect(mapRequestToArgs)(controller)(req, res, next);
      expect(next).to.have.been.called;
      // expect(next.firstCall.args[0])
      //   .to.be.an.instanceOf(Error)
      //   .with.property('message')
      //   .that.contains('a message')
    });
  });
});