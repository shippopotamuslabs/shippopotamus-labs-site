package main

import "testing"

func TestDailyCapTripsAtLimit(t *testing.T) {
	d := newDailyCap(2)
	if d.reached() {
		t.Fatal("fresh cap already reached")
	}
	d.record()
	if d.reached() {
		t.Fatal("reached after 1 of 2")
	}
	d.record()
	if !d.reached() {
		t.Fatal("not reached after 2 of 2")
	}
}

func TestDailyCapResetsOnNewDay(t *testing.T) {
	d := newDailyCap(1)
	d.record()
	if !d.reached() {
		t.Fatal("not reached after 1 of 1")
	}
	d.day = "1999-01-01" // stale day must read as a fresh day
	if d.reached() {
		t.Fatal("stale day still counts toward today")
	}
	d.record()
	if d.day != todayUTC() || d.count != 1 {
		t.Fatalf("record did not roll over: day=%s count=%d", d.day, d.count)
	}
}
