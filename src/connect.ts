import express from 'express';
import _ from 'lodash';
import ApiError from './api-error';

export type TMapRequestToArgs = string | string[] | ((req: express.Request) => any[]);

export type TConnect = (mapRequestToArgs: TMapRequestToArgs, successStatus?: number)
  => (controller: Function) => express.RequestHandler;

/**
 * Connects a controller to an express route. This is a curried function. See how to use in example.
 * @param {(string | string[] | function)} mapRequestToArgs - A path, array of paths, or function that get arguments from the express req object.
 * @param {number} [successStatus = 200] - The success status to send to the end user.
 * @param {Object} controller - Your controller function.
 * @returns {RequestHandler} An express request handler.
 * 
 * @example <caption>A simple example</caption>
 * const { connect } = require('express-utils');
 * const getImage = require('./get-image-controller');
 * 
 * // For simple cases, use string. Defaults to 200 responses status code.
 * router.get('/images/:id', connect('params.id')(getImage));
 *
 * @example <caption>A more involved example</caption>
 * const { connect } = require('express-utils');
 * const getImageList = require('./get-image-list-controller');
 * 
 * router.get('/images', connect(['body.ids', 'query.per_page'])(getListController));
 * 
 * @example <caption>When you need something more custom</caption>
 * const { connect } = require('express-utils');
 * const imageSearch = require('./image-search-controller');
 * 
 * const mapSearchToArgs = req => [{ 
 *   search_term: req.body.search_term,
 *   per_page: req.body.per_page,
 *   view: 'full',
 * }]
 * 
 * router.post('/images/search', connect(mapSearchToArgs, 203)(imageSearch));
 */

 export const connect: TConnect = (mapRequestToArgs, successStatus = 200) => controller => async (req, res) => {
  let args: any[] = [];

  if (Array.isArray(mapRequestToArgs)) {
    args = mapRequestToArgs.map(path => _.get(req, path.replace('req.', '')));
  } else if (_.isFunction(mapRequestToArgs)) {
    args = mapRequestToArgs(req);
  } else if (_.isString(mapRequestToArgs)) {
    const path = mapRequestToArgs.replace('req.', '');
    args = [_.get(req, path)];
  } else {
    throw Error('mapRequestToArgs must be one of Function, Array, or String.')
  }

  try {
    const response = await controller(...args);
    _.isEmpty(response)
      ? res.sendStatus(successStatus)
      : res.status(successStatus).send(response)
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).send(error.message);
    } else {
      res.status(500).json(error);
    }
  }
}
