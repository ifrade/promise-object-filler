'use strict';

const chai = require('chai');
const FillBuilder = require('../index.js');

const expect = chai.expect;

describe('filling object', function () {

    const expectFailure = p => new Promise((fullfill, reject) =>
                                           p.then(() => reject(new Error('Unexpected success')))
                                            .catch(e => fullfill()));

    const promiseReturningFunction = (valueToReturn) =>
          new Promise((fullfill, reject) => {
              setTimeout(() => fullfill(valueToReturn), 500);
          });

    const failedPromiseFunction = () =>
          new Promise((fullfill, reject) => {
              setTimeout(() => reject(new Error('wops')), 500);
          });

    describe('on new object', function () {
        it('sucess', function () {
            const filler = new FillBuilder();
            filler
                .add('test1', promiseReturningFunction('test1-z'))
                .add('', promiseReturningFunction({ x: '1'}))
                .add('test2', promiseReturningFunction('test2-y'));

            return filler
                .promise()
                .then(o => {
                    expect(o).to.be.an('object');
                    expect(o).to.have.property('x', '1');
                    expect(o).to.have.property('test1', 'test1-z');
                    expect(o).to.have.property('test2', 'test2-y');
                });
        });

        it('failure (resilient, no default value)', function () {
            const filler = new FillBuilder();
            filler.setResilient(true);
            filler.add('test1', failedPromiseFunction())
                .add('test2', promiseReturningFunction('test2-y'));

            return filler
                .promise()
                .then(o => {
                    expect(o).to.be.an('object');
                    expect(o).to.not.have.property('test1');
                    expect(o).to.have.property('test2', 'test2-y');
                });
        });

        it('failure (resilient, default value)', function () {
            const filler = new FillBuilder();
            filler.setResilient(true);
            filler.add('test1', failedPromiseFunction(), 'something wrong')
                .add('test2', promiseReturningFunction('test2-y'));

            return filler
                .promise()
                .then(o => {
                    expect(o).to.be.an('object');
                    expect(o).to.have.property('test1', 'something wrong');
                    expect(o).to.have.property('test2', 'test2-y');
                });
        });

        it('failure (giving up)', function () {
            const filler = new FillBuilder();
            filler.add('test1', failedPromiseFunction(), 'something wrong')
                .add('test2', promiseReturningFunction('test2-y'));

            return expectFailure(filler.promise());
        });
    });

    describe('on existing object', function () {
        it('sucess', function () {
            const filler = new FillBuilder({ here: 'before' });
            filler
                .add('test1', promiseReturningFunction('test1-z'))
                .add('', promiseReturningFunction({ x: '1'}))
                .add('test2', promiseReturningFunction('test2-y'));

            return filler
                .promise()
                .then(o => {
                    expect(o).to.be.an('object');
                    expect(o).to.have.property('here', 'before');
                    expect(o).to.have.property('here', 'before');
                    expect(o).to.have.property('x', '1');
                    expect(o).to.have.property('test1', 'test1-z');
                    expect(o).to.have.property('test2', 'test2-y');
                });
        });

        it('failure (resilient, no default value)', function () {
            const filler = new FillBuilder({ here: 'before' });
            filler.setResilient(true);
            filler.add('test1', failedPromiseFunction())
                .add('test2', promiseReturningFunction('test2-y'));

            return filler
                .promise()
                .then(o => {
                    expect(o).to.be.an('object');
                    expect(o).to.have.property('here', 'before');
                    expect(o).to.have.property('here', 'before');
                    expect(o).to.not.have.property('test1');
                    expect(o).to.have.property('test2', 'test2-y');
                });
        });

        it('failure (resilient, default value)', function () {
            const filler = new FillBuilder({ here: 'before' });
            filler.setResilient(true);
            filler.add('test1', failedPromiseFunction(), 'something wrong')
                .add('test2', promiseReturningFunction('test2-y'));

            return filler
                .promise()
                .then(o => {
                    expect(o).to.be.an('object');
                    expect(o).to.have.property('here', 'before');
                    expect(o).to.have.property('test1', 'something wrong');
                    expect(o).to.have.property('test2', 'test2-y');
                });
        });

        it('failure (giving up)', function () {
            const filler = new FillBuilder({ here: 'before' });
            filler.add('test1', failedPromiseFunction(), 'something wrong')
                .add('test2', promiseReturningFunction('test2-y'));

            return expectFailure(filler.promise());
        });
    });
});
