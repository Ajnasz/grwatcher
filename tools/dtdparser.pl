#!/usr/bin/perl
use strict;

use Data::Dumper;
use XML::DTD;
use File::Path;
use File::Copy;

my $inputDir = '../defaultlocales';
my $outputDir = '../chrome/locale';

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
        if (defined($f->{$refKey}->{ENTITYDEF})) {
          if ($f->{$refKey}->{ENTITYDEF} eq $reference->{$refKey}->{ENTITYDEF}) {
              push(@{$errors->{'sameasref'}}, {'locale' => $locale, 'entity' => $refKey});
          } elsif ($f->{$refKey}->{ENTITYDEF} eq '') {
              push(@{$errors->{'empty'}}, {'locale' => $locale, 'entity' => $refKey});
          }
        } else {
              push(@{$errors->{'missing'}}, {'locale' => $locale, 'entity' => $refKey});
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
  my $reference = readFile($inputDir .'/en-US/grwatcher.dtd');
  my $localeReference = readFile($inputFile);

  foreach my $key (keys %{$reference->entman->{GENERAL}}) {
    if (!isException($key) && !$localeReference->entman->{GENERAL}->{$key}->{ENTITYDEF}) {
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
  my $reference = readFile($inputDir .'/en-US/grwatcher.dtd');
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
  my $reference = readFile($inputDir .'/en-US/grwatcher.dtd');
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
  my $reference = readFile($inputDir .'/en-US/grwatcher.dtd');
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

sub copyProperties {
  opendir(DIR, $inputDir);
  my @DIRS = readdir(DIR);
  closedir(DIR);
  print "Copy prooperties\n";

  foreach (@DIRS) {
    copy($inputDir . '/' .$_ . '/grwatcher.properties', $outputDir . '/' . $_ .'/grwatcher.properties');
  }
}

sub copyRef {
  my $dir = $outputDir . '/en-US/';
  unless (-d $dir) {
    mkpath($dir);
  }
  copy($inputDir . '/en-US/grwatcher.properties', $outputDir . '/en-US/grwatcher.properties');
  copy($inputDir . '/en-US/grwatcher.dtd', $outputDir . '/en-US/grwatcher.dtd');
}

my $reference = getFileGenerals($inputDir . '/en-US/grwatcher.dtd');

# print Dumper($reference);

opendir(DIR, $inputDir);
my @DIRS = readdir(DIR);
closedir(DIR);

my $errors = {
  'empty' => [],
  'missing' => [],
  'sameasref' => [],
};

# collect issues
my $results = {};
foreach my $dir (@DIRS) {
    if ($dir ne '..' and $dir ne 'en-US' and $dir ne '.') {
        my $f = getFileGenerals($inputDir . '/' . $dir . '/grwatcher.dtd');
        my $result = checkFile($f, $dir, $reference);
        @{$errors->{empty}} = (@{$errors->{empty}}, @{$result->{empty}});
        @{$errors->{missing}} = (@{$errors->{missing}}, @{$result->{missing}});
        @{$errors->{sameasref}} = (@{$errors->{sameasref}}, @{$result->{sameasref}});
        $results->{$dir} = $result;
    }
}
# where translation is the same as the original
my $sameasrefCount = scalar(@{$errors->{'sameasref'}});
# where the translation is an empty string
my $emptyCount = scalar(@{$errors->{'empty'}});
# where the translation is missing
my $missingCount = scalar(@{$errors->{'missing'}});

if ($sameasrefCount > 0) {
  printf "has %d same as reference\n", $sameasrefCount;
  my $locales = {};
  foreach my $same (@{$errors->{'sameasref'}}) {
      $locales->{$same->{'locale'}} = [] unless defined($locales->{$same->{'locale'}});
      push(@{$locales->{$same->{'locale'}}}, $same->{'entity'});
  }
  print join(' ', keys $locales);
  print "\n";
  print "Remove same\n";
  foreach my $locale (keys $locales) {
    removeSame($locale);
  }
}

if ($emptyCount > 0) {
  printf "has %d empty\n", $emptyCount;
  my $locales = {};
  foreach my $empties (@{$errors->{'empty'}}) {
      $locales->{$empties->{'locale'}} = [] unless defined($locales->{$empties->{'locale'}});
      push(@{$locales->{$empties->{'locale'}}}, $empties->{'entity'});
  }
  print join(' ', keys $locales);
  print "\n";
  if ($fillEmpty) {
      print "Fill missing\n";
      foreach (keys $locales) {
        fillMissing($_, "$outputDir/$_/grwatcher.dtd");
      }
  } elsif ($removeEmpty) { # remove duplicated locales
      print "Remove empty\n";
      foreach (keys $locales) {
        removeEmpty($_, "$outputDir/$_/grwatcher.dtd");
      }
  }
}
if ($missingCount > 0) {
  printf "%d is missing\n", $missingCount;
  my $locales = {};
  foreach my $missing (@{$errors->{'missing'}}) {
      $locales->{$missing->{'locale'}} = [] unless defined($locales->{$missing->{'locale'}});
      push(@{$locales->{$missing->{'locale'}}}, $missing->{'entity'});
  }
  print join(' ', keys $locales);
  print "\n";
  if ($fillEmpty) { # fix missing locales
      print "Fill missing\n";
      foreach (keys $locales) {
        fillMissing($_, "$outputDir/$_/grwatcher.dtd");
      }
  } elsif ($removeEmpty) { # remove duplicated locales
      print "Remove empty\n";
      foreach (keys $locales) {
        removeEmpty($_, "$outputDir/$_/grwatcher.dtd");
      }
  }
}

copyProperties();
copyRef();

exit 0;
