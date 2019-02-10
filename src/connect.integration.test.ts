import express from 'express';
import chai from 'chai';
import chaiSinon from 'sinon-chai';
import sinon from 'sinon';
import request from 'supertest';
import { connect } from './connect';

chai.use(chaiSinon);
const { expect } = chai;

describe('connected controller', () => {
  let sandbox: sinon.SinonSandbox;
  let controller: sinon.SinonStub;
  let errorHandler: sinon.SinonStub;
  let app: express.Application;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    controller = sandbox.stub().resolves({ payload: 'data' });
    errorHandler = sandbox.stub();
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
  });

  context.skip('if controller throws an error', () => {
    beforeEach(() => {
      controller.throws(new Error('banana'));
    });

    it('should pass the request to the error middlware', async () => {
      await request(app).get('123');

      expect(errorHandler).to.be.called;
    })
  })
})