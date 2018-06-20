import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { CompareData } from './compare-data.model';
import { AuthService } from '../user/auth.service';

@Injectable()
export class CompareService {
  dataEdited = new BehaviorSubject<boolean>(false);
  dataIsLoading = new BehaviorSubject<boolean>(false);
  dataLoaded = new Subject<CompareData[]>();
  dataLoadFailed = new Subject<boolean>();
  userData: CompareData;
  constructor(private http: Http,
              private authService: AuthService) {
  }

  onStoreData(data: CompareData): any {
    this.dataLoadFailed.next(false);
    this.dataIsLoading.next(true);
    this.dataEdited.next(false);
    this.userData = data;
    this.authService.getAuthenticatedUser().getSession((err, session) => {
      if (err) {
        return;
      }
      // this.http.post('https://8r61eq36ve.execute-api.us-west-2.amazonaws.com/dev/compare-yourself', data, {
      this.http.post('https://0p55ydct7l.execute-api.us-west-2.amazonaws.com/dev/generate', data, {
        headers: new Headers({'Authorization': session.getIdToken().getJwtToken()})
      })
        .map(
        (response: Response) => response.json()
      )
        .subscribe(
          (result) => {
            // this.dataLoadFailed.next(false);
            this.dataIsLoading.next(false);
            // this.dataEdited.next(true);
            const content = [JSON.parse(result.toString())];
            // const content = [result.toString()];
            console.log(content);
            this.downloadCSV({filename: 'Report.csv', stockData: content});
          },
          (error) => {
            this.dataIsLoading.next(false);
            this.dataLoadFailed.next(true);
            this.dataEdited.next(false);
          }
        );
    });
  }

  convertArrayOfObjectsToCSV(args) {
    let result, ctr, keys, columnDelimiter, lineDelimiter, data;
    console.log('data: ');
    console.log(args.data);

    data = args.data || null;
    if (data == null || !data.length) {
      return null;
    }
    console.log('data II: ');
    console.log(args.data);
    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
      ctr = 0;
      keys.forEach(function(key) {
        if (ctr > 0) {
          result += columnDelimiter;
        }

        result += item[key];
        ctr++;
      });
      result += lineDelimiter;
    });

    return result;
  }
  downloadCSV(args) {
    // const stockData: any = [
    //   {
    //     Symbol: 'AAPL',
    //     Company: 'Apple Inc.',
    //     Price: '132.54'
    //   }];
    let data, filename, link, stockData;
    console.log('Logging: ');
    console.log(stockData);

    stockData = args.stockData || [
      {
        Symbol: 'AAPL',
        Company: 'Apple Inc.',
        Price: '132.54'
      }];
    let csv = this.convertArrayOfObjectsToCSV({
      data: stockData
    });

    console.log('Logging II: ');
    console.log(csv);
    if (csv == null) {
      return;
    }

    filename = args.filename || 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  }


  // onStoreData(data: CompareData) {
  //   this.dataLoadFailed.next(false);
  //   this.dataIsLoading.next(true);
  //   this.dataEdited.next(false);
  //   this.userData = data;
  //   this.authService.getAuthenticatedUser().getSession((err, session) => {
  //     if (err) {
  //       return;
  //     }
  //     this.http.post('https://8r61eq36ve.execute-api.us-west-2.amazonaws.com/dev/compare-yourself', data, {
  //       headers: new Headers({'Authorization': session.getIdToken().getJwtToken()})
  //     })
  //       .subscribe(
  //         (result) => {
  //           this.dataLoadFailed.next(false);
  //           this.dataIsLoading.next(false);
  //           this.dataEdited.next(true);
  //         },
  //         (error) => {
  //           this.dataIsLoading.next(false);
  //           this.dataLoadFailed.next(true);
  //           this.dataEdited.next(false);
  //         }
  //       );
  //   });
  // }

  onRetrieveData(all = true) {
    this.dataLoaded.next(null);
    this.dataLoadFailed.next(false);
    this.authService.getAuthenticatedUser().getSession((err, session) => {
      const queryParam = '?accessToken=' + session.getAccessToken().getJwtToken();
      let urlParam = 'all';
      if (!all) {
        urlParam = 'single';
      }
      this.http.get('https://8r61eq36ve.execute-api.us-west-2.amazonaws.com/dev/compare-yourself/' + urlParam + queryParam, {
        headers: new Headers({'Authorization': session.getIdToken().getJwtToken()})
      })
        .map(
          (response: Response) => response.json()
        )
        .subscribe(
          (data) => {
            if (all) {
              this.dataLoaded.next(data);
            } else {
              console.log(data);
              if (!data) {
                this.dataLoadFailed.next(true);
                return;
              }
              this.userData = data[0];
              this.dataEdited.next(true);
            }
          },
          (error) => {
            console.log(error);
            this.dataLoadFailed.next(true);
            this.dataLoaded.next(null);
          }
        );
    });
  }
  onDeleteData() {
    this.dataLoadFailed.next(false);
    this.authService.getAuthenticatedUser().getSession((err, session) => {
      // We are passing dummy token since we do not valid at the API gate way.
      this.http.delete('https://8r61eq36ve.execute-api.us-west-2.amazonaws.com/dev/compare-yourself/?accessToken=XXX', {
        headers: new Headers({'Authorization': session.getIdToken().getJwtToken()})
      })
        .subscribe(
          (data) => {
            console.log(data);
          },
          (error) => this.dataLoadFailed.next(true)
        );
    });
  }
}
