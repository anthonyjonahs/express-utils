import express from 'express';
import chai from 'chai';
import chaiSinon from 'sinon-chai';
import sinon from 'sinon';
import request from 'supertest';
import { connect } from './connect';
import { RSA_NO_PADDING } from 'constants';

chai.use(chaiSinon);
const { expect } = chai;

describe('connected controller', () => {
  let sandbox: sinon.SinonSandbox;
  let controller: sinon.SinonStub;
  let errorHandlerSpy: sinon.SinonSpy;
  let app: express.Application;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    controller = sandbox.stub().resolves({ payload: 'data' });
    errorHandlerSpy = sandbox.spy();
    const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
      errorHandlerSpy(err);
      res.sendStatus(500);
    };
    app = express();
    app.get('/:id', connect('req.params.id')(controller));
    app.use(errorHandler);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the correct response', async () => {
    const res = await request(app).get('/123').expect(200);
    
    expect(res.body).to.contain({ payload: 'data' });
    expect(controller).to.have.been.calledWith('123');
    expect(errorHandlerSpy).to.not.be.called;
  });

  context('if controller throws an error', () => {
    beforeEach(() => {
      controller.throws(new Error('banana'));
    });

    it('should pass the request to the error middleware', async () => {
      await request(app).get('/123');

      expect(errorHandlerSpy).to.be.calledOnce;
      expect(errorHandlerSpy.firstCall.args[0])
        .to.be.instanceOf(Error)
        .with.property('message')
        .that.equals('banana');
    })
  })
})