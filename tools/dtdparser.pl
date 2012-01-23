#!/usr/bin/perl
use strict;

use Data::Dumper;
use XML::DTD;
use File::Path;
use File::Copy;

my $inputDir = '../defaultlocales';
my $outputDir = '../chrome/locale';
my $refLocale = 'en-US';

my $exceptions = ['GRWpreferences.account.tab.oauth'];

my $fillEmpty;
my $removeEmpty;
my $removeMissing;

if ($ARGV[0] eq 'babelzilla') {
  $fillEmpty = 0;
  $removeEmpty = 1;
  $removeMissing = 1;
} elsif ($ARGV[0] eq 'release') {
  $fillEmpty = 1;
  $removeEmpty = 0;
  $removeMissing = 0;
} else {
  if (!$ARGV[0]) {
    print "no arguments defined\n";
  } else {
    print "wrong arguments given\n";
  }
  exit 1;
}

sub readFile {
    my $file = shift;

    my $dtd = new XML::DTD;
    open(FH,'<' . $file);
    $dtd->fread(*FH);
    close(FH);
    return $dtd;
}

sub getFileGenerals {
    my $file = shift;
    my $dtd = readFile($file);
    return $dtd->entman->{GENERAL};
}

sub writeFile {
    my $file = shift;
    my $content = shift;

    my $dtd = new XML::DTD;
    $dtd->sread($content);
    open(FH,'>' . $file);
    $dtd->fwrite(*FH);
    close(FH);
}

sub isException {
  my $entity = shift;
  my @grepped = grep(/^$entity/, @{$exceptions});
  return scalar(@grepped) > 0;
}

sub checkFile {
    my $f = shift;
    my $locale = shift;
    my $reference = shift;

    my $errors = {
        'empty' => [],
        'missing' => [],
        'sameasref' => [],
    };

    foreach my $refKey (keys %$reference) {
      if (!isException($refKey)) {
        if (defined($f->{$refKey}->{ENTITYDEF})) {
          if ($f->{$refKey}->{ENTITYDEF} eq $reference->{$refKey}->{ENTITYDEF}) {
              push(@{$errors->{'sameasref'}}, {'locale' => $locale, 'entity' => $refKey});
          } elsif ($f->{$refKey}->{ENTITYDEF} eq '') {
              push(@{$errors->{'empty'}}, {'locale' => $locale, 'entity' => $refKey});
          } else {
          }
        } else {
              push(@{$errors->{'missing'}}, {'locale' => $locale, 'entity' => $refKey});
        }
      }
    }
    return $errors;
}

# not so beautiful, there is no method to delete an entity from a dtd, so do it manually
# first delete from the $dtd-{ALL} then delete from the $ref->entman->{GENERAL}
sub deleteEntity {
  my $ref = shift;
  my $entity = shift;
  my $validEntities = [];
  foreach my $index (0 .. $#{$ref->{ALL}}) {
    # print @{$ref->{ALL}}[$index], "\n";
    unless ($ref->{ALL}[$index]->{NAME} eq $entity) {
      push(@{$validEntities}, $ref->{ALL}[$index]);
    }
  }
  $ref->{ALL} = $validEntities;
  foreach my $key (keys %{$ref->entman->{GENERAL}}) {
    if ($key eq $entity) {
      delete $ref->entman->{GENERAL}->{$key};
    }
  }
}

sub keyInRefAll {
  my $ref = shift;
  my $entity = shift;
  my $output = 0;
  foreach my $index (0 .. $#{$ref->{ALL}}) {
    if (($ref->{ALL}[$index]->{CMPNTTYPE} eq "entity") and ($ref->{ALL}[$index]->{NAME} eq $entity)) {
      $output = 1;
      last;
    }
  }
  return $output;
}

sub fillMissing {
  my $locale = shift;
  my $inputFile = shift;
  my $reference = readFile($inputDir .'/' . $refLocale . '/grwatcher.dtd');
  my $localeReference = readFile($inputFile);

  foreach my $key (keys %{$reference->entman->{GENERAL}}) {
    if (!$localeReference->entman->{GENERAL}->{$key}->{ENTITYDEF}) {
      my $ent = XML::DTD::Entity->new('<!ENTITY ' . $key .  ' "' . $reference->entman->{GENERAL}->{$key}->{ENTITYDEF} . '">' . "\n");
      # $localeReference->entman->insertge($ent);
      push(@{$localeReference->{ALL}}, $ent) unless (keyInRefAll($localeReference, $key));
      $localeReference->entman->{GENERAL}->{$key} = $ent;
     }
  }
  my $dir = $outputDir . '/' . $locale;
  unless (-d $dir) {
    mkpath($dir);
  }
  open(FH, '>', $dir . '/grwatcher.dtd');
  $localeReference->fwrite(*FH);
  close(FH);
}

sub removeEmpty {
  my $locale = shift;
  my $inputFile = shift;
  my $reference = readFile($inputDir .'/' . $refLocale . '/grwatcher.dtd');
  my $localeReference = readFile($inputFile);

  foreach my $key (keys %{$reference->entman->{GENERAL}}) {
    if (!isException($key) and !defined($localeReference->entman->{GENERAL}->{$key}->{ENTITYDEF}) || $localeReference->entman->{GENERAL}->{$key}->{ENTITYDEF} eq "") {
      deleteEntity($localeReference, $key);
    }
  }
  my $dir = $outputDir . '/' . $locale;
  unless (-d $dir) {
    mkpath($dir);
  }
  open(FH, '>', $dir . '/grwatcher.dtd');
  $localeReference->fwrite(*FH);
  close(FH);
}

sub removeSame {
  my $locale = shift;
  my $reference = readFile($inputDir .'/' . $refLocale . '/grwatcher.dtd');
  my $localeReference = readFile($inputDir .'/' . $locale . '/grwatcher.dtd');

  foreach my $key (keys %{$reference->entman->{GENERAL}}) {
     if (!isException($key) and ($localeReference->entman->{GENERAL}->{$key}->{ENTITYDEF} eq $reference->entman->{GENERAL}->{$key}->{ENTITYDEF})) {
       deleteEntity($localeReference, $key);
     }
  }
  my $dir = $outputDir . '/' . $locale;
  unless (-d $dir) {
    mkpath($dir);
  }
  open(FH, '>', $dir . '/grwatcher.dtd');
  $localeReference->fwrite(*FH);
  close(FH);
}

sub fillEmpty {
  my $locale = shift;
  my $reference = readFile($inputDir .'/' . $refLocale . '/grwatcher.dtd');
  my $localeReference = readFile($inputDir .'/' . $locale . '/grwatcher.dtd');

  foreach my $key (keys %{$reference->entman->{GENERAL}}) {
     if (!isException($key) and !defined($localeReference->entman->{GENERAL}->{$key}->{ENTITYDEF}) || $localeReference->entman->{GENERAL}->{$key}->{ENTITYDEF} eq "") {
       my $ent = XML::DTD::Entity->new('<!ENTITY ' . $key .  ' "' . $reference->entman->{GENERAL}->{$key}->{ENTITYDEF} . '">');
       $localeReference->entman->insertge($ent);
     }
  }
  my $dir = 'fillemptylocales/' . $locale;
  unless (-d $dir) {
    mkpath($dir);
  }
  open(FH, '>', $dir . '/grwatcher.dtd');
  $localeReference->fwrite(*FH);
  close(FH);
}

sub copyOriginals {
  opendir(DIR, $inputDir);
  my @DIRS = readdir(DIR);
  closedir(DIR);

  my $dir;


}


my $reference = getFileGenerals($inputDir . '/' . $refLocale . '/grwatcher.dtd');

copyOriginals();

# print Dumper($reference);

opendir(DIR, $inputDir);
my @DIRS = readdir(DIR);
closedir(DIR);

foreach (@DIRS) {
  if ($_ ne '.' && $_ ne '..') {
    my $dir = $outputDir . '/' .$_;
    unless (-d $dir) {
      mkpath($dir);
    }
    copy($inputDir . '/' .$_ . '/grwatcher.properties', $dir .'/grwatcher.properties');
    copy($inputDir . '/' .$_ . '/grwatcher.dtd', $dir .'/grwatcher.dtd');
    if ($fillEmpty) {
      if ($_ ne $refLocale) {
        removeSame($_);
        fillMissing($_, $outputDir . '/' . $_ . '/grwatcher.dtd');
      }
    } else {
      if ($_ ne $refLocale) {
        removeSame($_);
        removeEmpty($_, $outputDir. '/' . $_ . '/grwatcher.dtd');
      }
    }
  }
}

exit 0;
