import {Datasource} from "../module";
import Q from "q";

describe('GenericDatasource', function() {
    var ctx = {};

    beforeEach(function() {
        ctx.$q = Q;
        ctx.backendSrv = {};
        ctx.ds = new Datasource({}, ctx.$q, ctx.backendSrv);
    });

    it('should return an empty array when no targets are set', function(done) {
        ctx.ds.query({targets: []}).then(function(result) {
            expect(result).to.have.length(0);
            done();
        });
    });

    it('should return the server results when a target is set', function(done) {
        ctx.backendSrv.datasourceRequest = function(request) {
            return ctx.$q.when({
                _request: request,
                data: [
                    {
                        target: 'X',
                        datapoints: [1, 2, 3]
                    }
                ]
            });
        };

        ctx.ds.query({targets: ['hits']}).then(function(result) {
            expect(result._request.data.targets).to.have.length(1);

            var series = result.data[0];
            expect(series.target).to.equal('X');
            expect(series.datapoints).to.have.length(3);
            done();
        });
    });
});
