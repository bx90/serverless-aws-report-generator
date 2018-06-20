import { Component, OnInit, ViewChild } from '@angular/core';
import { CompareData } from '../compare-data.model';
import { NgForm } from '@angular/forms';

import { CompareService } from '../compare.service';

@Component({
  selector: 'app-compare-input',
  templateUrl: './compare-input.component.html',
  styleUrls: ['./compare-input.component.css']
})
export class CompareInputComponent implements OnInit {
  @ViewChild('compareForm') form: NgForm;
  isLoading = false;
  couldNotLoadData = false;

  constructor(private compareService: CompareService) {
  }

  ngOnInit() {
    this.compareService.dataIsLoading.subscribe(
      (isLoading: boolean) => this.isLoading = isLoading
    );
    this.compareService.dataLoadFailed.subscribe(
      (didFail: boolean) => {
        this.couldNotLoadData = didFail;
        this.isLoading = false;
      }
    );
  }

  onSubmit() {
    const data: CompareData = {
      age: this.form.value.age as number,
      height: this.form.value.height as number,
      income: this.form.value.income as number
    };
    this.compareService.onStoreData(data);
  }

  onFetchStoredData() {
    this.compareService.onRetrieveData(false);
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
    const stockData: any = [
      {
        Symbol: 'AAPL',
        Company: 'Apple Inc.',
        Price: '132.54'
      }];
    let data, filename, link;
    console.log('Logging: ');
    console.log(stockData);

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

}
