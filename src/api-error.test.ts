 import { expect } from 'chai';
import ApiError from './api-error';

describe('ApiError', () => {
  let apiError: ApiError;

  beforeEach(() => {
    apiError = new ApiError('test');
  });

  describe('.with', () => {
    it('should return a custom error', () => {
      expect(apiError.with(420, 'chill out', 'a stack trace')).to.contain({
        statusCode: 420,
        message: 'chill out',
        info: 'a stack trace',
        module: 'test',
      });
    });
  });

  describe('.forbidden', () => {
    it('should return a 403 Forbidden error', () => {
      expect(apiError.forbidden())
        .to.have.property('statusCode').that.equals(403);
    });
  });
  
  describe('.unauthorized', () => {
    it('should return a 401 Unauthorized error', () => {
      expect(apiError.unauthorized())
        .to.have.property('statusCode').that.equals(401);
    });
  });
  
  describe('.notFound', () => {
    it('should return a 404 Not Found error', () => {
      expect(apiError.notFound())
        .to.have.property('statusCode').that.equals(404);
    });
  });
  
  describe('.badRequest', () => {
    it('should return a 400 Forbidden error', () => {
      expect(apiError.badRequest())
        .to.have.property('statusCode').that.equals(400);
    });
  });
});
