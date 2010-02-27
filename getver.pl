#!/usr/bin/perl

use strict;


my $result = `hg log --limit 1`;
$result =~ /changeset:\s+([^:]+)/;
my $commitnum = $1;
$result =~ /branch:\s+(.+)/;
print "$commitnum.$1";
